import {Injectable, Injector} from '@angular/core';
import {Events} from 'ionic-angular';
import {TestSuiteService} from './TestSuiteService';
import {FeatureService} from '../feature/FeatureService';
import {FeatureServiceImpl} from '../feature/FeatureServiceImpl';
import {TestSuite} from '../../models/TestSuite';
import {TestSuiteRepository} from '../../repository/TestSuiteRepository';
import {Feature} from '../../models/Feature';
import * as fs from 'fs'
import {FileSystem} from '../storage/FileSystem';
import {GherkinService} from '../gherkin/GherkinService';
import {SettingsService} from '../settings/SettingsService';
import {SettingsServiceImpl} from '../settings/SettingsServiceImpl';
import {AutomationService, ExecutionRuntime} from '../automation/AutomationService';
import {JavaAutomationService} from '../automation/JavaAutomationService';



/* generic declaration for readdir node module */
declare var readdir: any;
@Injectable()
export class TestSuiteServiceImpl implements TestSuiteService {
  private fileSystem: FileSystem;
  private gherkinService: GherkinService;
  private featureService: FeatureService
  private testSuiteRepository: TestSuiteRepository
  private settingsService: SettingsService;
  private automationService: AutomationService

  constructor(fileSystem: FileSystem, gherkinService: GherkinService,
    featureService: FeatureServiceImpl,
    testSuiteRepository: TestSuiteRepository,
    settingsService: SettingsServiceImpl, private injector: Injector, private events:Events) {
    this.fileSystem = fileSystem;
    this.gherkinService = gherkinService;
    this.featureService = featureService;
    this.testSuiteRepository = testSuiteRepository;
    this.settingsService = settingsService;

     this.events.subscribe('feature:create', (data) => {
      let feature  = <Feature> data[0]
      console.log('[Feature Created] event arrived:', feature);
      this.updateMetrics(feature.getTestSuiteName(),feature);
    })

  }

  updateMetrics(testsuitename: string, feature:Feature){
    this.testSuiteRepository.getByName(testsuitename, (testsuite)=>{
       testsuite.incrementFeaturesCounter();
      if (feature.isAPI()) {
        testsuite.incrementApiTestCounter();
      } else {
        testsuite.incrementUiTestCounter()
      }
   
    this.save(testsuite,()=>{});
    })
  }

  folderExists(testsuiteFolderPath: string): boolean {

    return this.fileSystem.exists(testsuiteFolderPath)
  }

  exists(testSuiteName: string, testSuiteFolderPath: string): boolean {
    if (this.folderExists(testSuiteFolderPath))
      return true


  }

  public getAll(callback: (testsuite: Array<TestSuite>) => void): void {
    this.testSuiteRepository.getAll(callback);
  }

  public refresh() {

  }

  public get(testSuiteName: string): TestSuite {
    return;
  }

  create(testSuiteName: string, testSuiteFolderPath: string, executionRuntimeType: ExecutionRuntime): void {
    this.fileSystem.createFolder(testSuiteFolderPath)
    let projectFileNamePath = testSuiteFolderPath+this.fileSystem.fileSeparator()+testSuiteName+'.project'
    this.fileSystem.createFile(projectFileNamePath)

    switch (executionRuntimeType) {
      case ExecutionRuntime.JAVA:
        this.automationService = this.injector.get(JavaAutomationService)
        this.automationService.generateAutomationFolderLayout(testSuiteName, testSuiteFolderPath)
        break
      default:
        this.automationService = this.injector.get(JavaAutomationService)
        this.automationService.generateAutomationFolderLayout(testSuiteName, testSuiteFolderPath)
        break
    }

    let testsuite = new TestSuite(testSuiteName, false,null, testSuiteFolderPath, false, projectFileNamePath, ExecutionRuntime.JAVA)

    this.testSuiteRepository.save(testsuite,()=>{})


  }

  public save(testSuite: TestSuite, callback:(testsuite:TestSuite)=> void): void {
    this.testSuiteRepository.save(testSuite,()=>{});
  }

  delete(testsuite: TestSuite, callback: (testsuite: TestSuite) => void): void {
    this.featureService.getByTestSuite(testsuite.getId(), (features) => {
      features.forEach((feature, index, array) => {
        this.featureService.delete(feature, function () { })
      })
      this.testSuiteRepository.delete(testsuite, callback)
    })
  }

  public listFeatureFiles(projectFilePath: string): Array<string> {
    let testSuiteName = this.getTestSuiteName(projectFilePath);

    let featureFilesFolder = this.getFeatureFilesFolder(projectFilePath);

    if (!this.fileSystem.isDir(featureFilesFolder)) {
      throw new Error('Unable to import test suite [' + testSuiteName + ']:' + featureFilesFolder
        + ' is not a directory');
    }

    return this.fileSystem.listFiles(featureFilesFolder, '**/*.feature', ["target"]);

  }
  public importFromLocalDir(projectFilePath: string, importIntoAppFolder: boolean): void {

    let testSuiteName = this.getTestSuiteName(projectFilePath);

    let testSuite: TestSuite = new TestSuite(testSuiteName, false, null,
      null, importIntoAppFolder,
      projectFilePath, ExecutionRuntime.JAVA);
    this.testSuiteRepository.save(testSuite,()=>{});
    let featurefiles: Array<string> = this.listFeatureFiles(projectFilePath);
    featurefiles.forEach(file => {
      //Parse feature file

      let featureAst = this.gherkinService.parse(file);
      //Build feature ,scenario,steps model
      let feature: Feature = this.featureService.parseGherkinFile(projectFilePath)
      //Save to storage
      this.featureService.save(feature, (feature) => {
        testSuite.incrementFeaturesCounter();
        if (feature.isAPI()) {
          testSuite.incrementApiTestCounter();
        } else {
          testSuite.incrementUiTestCounter()
        }
      });
       this.testSuiteRepository.save(testSuite,()=>{});
    });

  }

  imporFromSCMRepo(testSuiteDirePath: string) {

  }

  importFeatureFiles(testSuiteName: string, files: Array<string>, importIntoAppFolder: boolean, executionRuntimeType: ExecutionRuntime): TestSuite {

    return
  }


  /*
   *  /A/B/C/testsuitename.project --> testsuitename
  */
  public getTestSuiteName(projectFilePath: string): string {

    if (!projectFilePath.endsWith(this.settingsService
      .getAppSettings()
      .TestSuiteProjectFileNameExtension)) {
      throw new Error('Invalid project file name :' + projectFilePath);
    }
    let projectFileName = this.getProjectFileName(projectFilePath)
    let endIndex = projectFileName.length - this.settingsService.getAppSettings().TestSuiteProjectFileNameExtension.length
    return projectFileName.substring(0, endIndex);

  }

  /*
  *  /A/B/C/testsuitename.project --> A/B/C/
  */
  public getFeatureFilesFolder(projectFilePath: string): string {
    let endIndex = projectFilePath.length - this.getProjectFileName(projectFilePath).length;
    return projectFilePath.substring(0, endIndex);
  }

  /*
  *  /A/B/C/testsuitename.project --> testsuitename.project
  */
  public getProjectFileName(projectFilePath: string): string {
    let pathElements: Array<string> = projectFilePath.split(this.fileSystem.fileSeparator());
    return pathElements[pathElements.length - 1];
  }


}