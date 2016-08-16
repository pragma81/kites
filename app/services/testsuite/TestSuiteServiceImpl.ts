import {Injectable} from '@angular/core'
import {TestSuiteService} from './TestSuiteService'
import {FeatureService} from '../feature/FeatureService'
import {FeatureServiceImpl} from '../feature/FeatureServiceImpl'
import {TestSuite, ExecutionRuntime} from '../../models/TestSuite'
import {TestSuiteRepository} from '../../repository/TestSuiteRepository'
import {Feature} from '../../models/Feature'
import * as fs from 'fs'
import {FileSystem} from '../storage/FileSystem'
import {GherkinService} from '../gherkin/GherkinService'
import {SettingsService} from '../settings/SettingsService'
import {SettingsServiceImpl} from '../settings/SettingsServiceImpl'


/* generic declaration for readdir node module */
declare var readdir: any;
@Injectable()
export class TestSuiteServiceImpl implements TestSuiteService {
  private fileSystem: FileSystem;
  private gherkinService: GherkinService;
  private featureService: FeatureService
  private testSuiteRepository: TestSuiteRepository
  private settingsService: SettingsService;

  constructor(fileSystem: FileSystem, gherkinService: GherkinService,
    featureService: FeatureServiceImpl,
    testSuiteRepository: TestSuiteRepository,
    settingsService: SettingsServiceImpl) {
    this.fileSystem = fileSystem;
    this.gherkinService = gherkinService;
    this.featureService = featureService;
    this.testSuiteRepository = testSuiteRepository;
    this.settingsService = settingsService;
  }

  public getAll(callback:(testsuite:Array<TestSuite>)=> void): void {
    this.testSuiteRepository.getAll(callback);
  }

  public refresh() {

  }

  public get(testSuiteName: string): TestSuite {
    return;
  }

  public create(testSuiteName: string) {
    return;
  }

  public save(testSuite: TestSuite): TestSuite {
    this.testSuiteRepository.save(testSuite);
    return testSuite;
  }

  delete(testsuite: TestSuite, callback:(testsuite:TestSuite)=> void): void {
    this.featureService.getByTestSuite(testsuite.getId(),(features)=>{
      features.forEach((feature,index,array)=>{
        this.featureService.delete(feature,function(){})
      })
       this.testSuiteRepository.delete(testsuite,callback)
    })
  }

  public listFeatureFiles(projectFilePath: string): Array<string> {
    let testSuiteName = this.getTestSuiteName(projectFilePath);

    let featureFilesFolder = this.getFeatureFilesFolder(projectFilePath);

    if (!this.fileSystem.isDir(featureFilesFolder)) {
      throw new Error('Unable to import test suite [' + testSuiteName + ']:' + featureFilesFolder
        + ' is not a directory');
    }

    return this.fileSystem.listFiles(featureFilesFolder, '**/*.feature');

  }
  public importFromLocalDir(projectFilePath: string, importIntoAppFolder: boolean): TestSuite {

    let testSuiteName = this.getTestSuiteName(projectFilePath);

    let testSuite: TestSuite = new TestSuite(testSuiteName, false, null,
      null, importIntoAppFolder,
      projectFilePath, ExecutionRuntime.ONELEO);
    this.testSuiteRepository.save(testSuite);
    let featurefiles: Array<string> = this.listFeatureFiles(projectFilePath);
    featurefiles.forEach(file => {
      //Parse feature file

      let featureAst = this.gherkinService.parse(file);
      //Build feature ,scenario,steps model
      let feature: Feature = this.featureService.parseGherkinFile(projectFilePath)
      //Save to storage
      this.featureService.save(feature);
      testSuite.incrementFeaturesCounter();
      if (feature.isAPI()) {
        testSuite.incrementApiTestCounter();
      } else {
        testSuite.incrementUiTestCounter()
      }
    });
    //Save Test Suite with updated tests statistics
    this.testSuiteRepository.save(testSuite);

    return testSuite;
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
      .getTestSuiteProjectFileNameExtension())) {
      throw new Error('Invalid project file name :' + projectFilePath);
    }
    let projectFileName = this.getProjectFileName(projectFilePath)
    let endIndex = projectFileName.length - this.settingsService.getAppSettings().getTestSuiteProjectFileNameExtension().length
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