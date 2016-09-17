import {Injectable, Component, ViewChild} from '@angular/core';
import {Slides, NavController, ViewController, Events} from 'ionic-angular';
import {TaskReporter, ReportCallback, TaskReport} from '../../task/task-reporter';
import {TestSuiteServiceImpl} from '../../../services/testsuite/TestSuiteServiceImpl';
import {TestSuiteService} from '../../../services/testsuite/TestSuiteService';
import {FileSystem} from '../../../services/storage/FileSystem';
import {Feature} from '../../../models/Feature';
import {AsyncTaskHandler, AsyncTaskExecutor, AsyncExecutionListener} from '../../../services/task/AsyncTaskExecutor';
import {TaskInfo, ExecutionResult} from '../../../services/task/TaskInfo';
import {Metric} from '../../../models/Metric';
import {FeatureService} from '../../../services/feature/FeatureService';
import {TestSuite} from '../../../models/TestSuite';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {ErrorDetail, Severity} from '../../../error/ErrorDetail';
import {ErrorWithDetails} from '../../../error/ErrorWithDetails';
import {FeatureRepository} from '../../../repository/FeatureRepository';
import {DashboardPage} from '../../dashboard/DashboardPage';
import {SettingsServiceImpl} from '../../../services/settings/SettingsServiceImpl';
import {GherkinService} from '../../../services/gherkin/GherkinService';
import {TestSuiteRepository} from '../../../repository/TestSuiteRepository';
import {AppConfig} from '../../../models/AppConfig';
import {ExecutionRuntime} from '../../../services/automation/AutomationService'
import { Observable}     from 'rxjs/Observable';


import 'rxjs/add/observable/from';


@Injectable()
@Component({
  templateUrl: 'build/components/test-suite/import/test-suite-importer.html',
  directives: [TaskReporter],
  providers: [TestSuiteRepository, GherkinService,
    SettingsServiceImpl, TestSuiteServiceImpl,
    FeatureServiceImpl, FileSystem, TaskReporter,
    FeatureRepository, AppConfig]

})
export class TestSuiteImporter implements AsyncTaskHandler, AsyncExecutionListener {
  private projectFilePath: string;
  private testSuiteName: string;
  private projectFileName: string;
  private fileSystem: FileSystem;
  private featureService: FeatureService;
  private importIntoAppFolder: boolean = false;
  private fileSelected: boolean = false
  private headerDescription = 'Please select a .project file in your filesystem'
  private isImport: boolean = true
  private isCheckSuccess: boolean
  private isProcessed: boolean = false
  private isValidate: boolean = false
  
  @ViewChild('wizard') slider: Slides;

  @ViewChild(TaskReporter)
  private taskReporter: TaskReporter;

  private testSuiteService: TestSuiteService;
  constructor(private nav: NavController, testSuiteService: TestSuiteServiceImpl,
    fileSystem: FileSystem, featureService: FeatureServiceImpl,
    private viewCtrl: ViewController, private events: Events) {
    console.log('explorer initialized')
    this.testSuiteService = testSuiteService;
    this.fileSystem = fileSystem;
    this.featureService = featureService;

  }

  onFileSelected(event) {
    this.fileSelected = true
    this.projectFilePath = event.srcElement.files[0].path;
    this.projectFileName = event.srcElement.files[0].name;

  }

  import() {

    this.testSuiteName = this.testSuiteService.getTestSuiteName(this.projectFilePath)

    let asynctaskExecutor = new AsyncTaskExecutor("Import feature files from " + this.projectFileName, this)
    asynctaskExecutor.addExecutionListener(this);
    let featureFiles = this.testSuiteService.listFeatureFiles(this.projectFilePath);

    featureFiles.forEach((file, index, array) => {

      let pathElements: Array<string> = file.split(this.fileSystem.fileSeparator());
      let featureFileName = pathElements[pathElements.length - 1]
      let taskId = featureFileName.concat("[" + index.toString() + "]")
      asynctaskExecutor.addTaskExecutionRequest(featureFileName + index, featureFileName, { "filepath": file, "testSuiteName": this.testSuiteName });

    });
    this.taskReporter.buildAsync(asynctaskExecutor);
    let successCallback = <ReportCallback>(tasksreport: Array<TaskReport>) => { this.nav.push(DashboardPage) }
    this.taskReporter.setProcessSuccessCallback(successCallback)
    let errorCallback = <ReportCallback>(tasksreport: Array<TaskReport>) => { this.nav.push(DashboardPage) }
    this.taskReporter.setProcessErrorCallback(errorCallback)

    this.taskReporter.startAsync();
  }

  back() {
    this.slider.slidePrev()
  }
  checkNextAction() {
    if (this.isImport) {
      this.slider.slideNext()
      this.import()
      this.isImport = false
      this.headerDescription = "Import results are shown below"
    } else {
      this.viewCtrl.dismiss()
    }
  }

  close() {
    this.viewCtrl.dismiss().then(() => {
      this.events.publish('testsuite:update')
    })
  }

  public checkBackAction() {
    if (this.isImport) {
      this.viewCtrl.dismiss()
    }
    else {
      this.slider.slidePrev()
      this.isImport = true
      this.headerDescription = "Please select a .project file in your filesystem"
    }
  }

  check(taskInfo: TaskInfo): Observable<TaskInfo> {
    try {
      let featureFilePath = taskInfo.getInputHolder().filepath;
      let testsuitename = taskInfo.getInputHolder().testSuiteName
      let feature = this.featureService.parseGherkinFile(featureFilePath);
      feature.setTestSuiteName(testsuitename)

      let metrics: Array<Metric> = [];
      metrics.push(new Metric(feature.getId(), "Id"));
      metrics.push(new Metric(feature.getScenariosTotal().toString(), "Scenario"));
      metrics.push(new Metric(feature.getAutoScenariosTotal().toString(), "Auto"));
      taskInfo.setMetrics(metrics);

      taskInfo.setOutputHolder(feature);
      taskInfo.setExecutionResult(ExecutionResult.success);
    } catch (err) {
      taskInfo.setExecutionResult(ExecutionResult.error)
      if (err instanceof ErrorWithDetails)
        taskInfo.addErrorDetail(err.getDetail());
      else {
        let error = new ErrorDetail(err.name, err.message, Severity.blocker)
        taskInfo.addErrorDetail(error)
      }
    }

    let arraySupport: Array<TaskInfo> = []
    arraySupport.push(taskInfo)
    return Observable.from(arraySupport)
  }
  process(taskInfo: TaskInfo): Observable<TaskInfo> {
    let feature: Feature = <Feature>taskInfo.getOutputHolder()
    return Observable.create(observer => {
      this.featureService.save(feature, feature => {

        try {
          taskInfo.setStatusDescription(`Feature [${feature.getId()}] saved `)
          taskInfo.setExecutionResult(ExecutionResult.success)
          observer.next(taskInfo)
          observer.complete()
        } catch (error) {

          taskInfo.setExecutionResult(ExecutionResult.error)
          if (error instanceof ErrorWithDetails)
            taskInfo.addErrorDetail(error.getDetail());
          else {
            let errorDetail = new ErrorDetail(error.name, error.message, Severity.blocker)
            taskInfo.addErrorDetail(errorDetail)
          }
          observer.next(taskInfo)
          observer.complete()
        }
      })
    })
  }

  beforeAsyncCheck(execution: AsyncTaskExecutor): void { }
  postAsyncCheck(execution: AsyncTaskExecutor): void { 
      this.isValidate = true
    if (execution.getResult() === ExecutionResult.success)
      this.isCheckSuccess = true
    else
      this.isCheckSuccess = false
  }


  beforeAsyncProcess(execution: AsyncTaskExecutor): void {
    let testSuite: TestSuite = new TestSuite(this.testSuiteName,
      false, null,
      null, this.importIntoAppFolder,
      this.projectFilePath, ExecutionRuntime.JAVA);

    execution.getTasksExecution().forEach((task) => {
      let feature = <Feature>task.getOutputHolder()
      testSuite.incrementFeaturesCounter();
      if (feature.isAPI()) {
        testSuite.incrementApiTestCounter();
      } else {
        testSuite.incrementUiTestCounter()
      }
    })
    this.testSuiteService.save(testSuite);

  }
  postAsyncProcess(execution: AsyncTaskExecutor): void {
    this.isProcessed = true
    if (execution.getResult() === ExecutionResult.success)
      this.isCheckSuccess = true
    else
      this.isCheckSuccess = false
  }

}
