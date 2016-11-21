import {Component, ViewChild, Injector} from '@angular/core';
import {NavParams, Events, ToastController, Tab} from 'ionic-angular';
import {Feature} from '../../models/Feature';
import {TaskReporter, ReportCallback, TaskReport} from '../task/task-reporter';
import {TaskInfo, ExecutionResult} from '../../services/task/TaskInfo';
import {AsyncExecutionListener, AsyncTaskExecutor} from '../../services/task/AsyncTaskExecutor';
import {FeatureService} from '../../services/feature/FeatureService';
import {FeatureImporterTaskHandler} from '../../services/feature/FeatureImporterTaskHandler';
import {Metric} from '../../models/Metric';
import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../error/ErrorDetail';
import {FeatureRepository} from '../../repository/FeatureRepository';
import {FileSystem} from '../../services/storage/FileSystem';
import {TCMService} from '../../services/tcm/TCMService';
import {JiraTCM} from '../../services/tcm/JiraTCM';
import {ScenarioTestCaseLinkValidator} from '../../services/tcm/ScenarioTestCaseLinkValidator';
import {ScenarioTestCaseLinkAsyncProcessTaskHandler} from '../../services/tcm/ScenarioTestCaseLinkAsyncProcessTaskHandler';
import {FeatureTCM} from '../../models/tcm/FeatureTCM';
import {TestCase} from '../../models/tcm/TestCase';
import {TCMSettings} from '../../models/TCMSettings';
import {SettingsService} from '../../services/settings/SettingsService';
import {SettingsServiceImpl} from '../../services/settings/SettingsServiceImpl';
import {TestSuiteRepository} from '../../repository/TestSuiteRepository';
import {FeatureServiceImpl} from '../../services/feature/FeatureServiceImpl';
import {Scenario} from '../../models/Scenario';


@Component({
  templateUrl: 'build/components/tcm/tcm-scenario-tab.html',
  directives: [TaskReporter],
  providers: [TaskReporter]
})
export class ScenarioTab implements AsyncExecutionListener {
  private tcmService: TCMService
  private featureTCM: FeatureTCM
  private feature: Feature
  private tcmSettings: TCMSettings
  private settingsService: SettingsService
  private featureService: FeatureService
  private testCases: Array<TestCase> = []
  private scenarioTestCaseLinkValidator: ScenarioTestCaseLinkValidator

  @ViewChild(TaskReporter)
  private taskReporter: TaskReporter;
  /* Currently TaskExecutor and TaskReporter has a sync api which does not fit well with asynchronous
    * comunication when working with multiple nested api calls. Until an asynch version is available
    * I can't  use synch version for this scenario
  */
  constructor(private navParams: NavParams, injector: Injector,
    settingsService: SettingsServiceImpl, private events: Events,
    featureService: FeatureServiceImpl, private toastController: ToastController) {

    this.feature = <Feature>this.navParams.data
    this.featureService = featureService
    this.settingsService = settingsService
    this.tcmService = injector.get(JiraTCM)
    this.tcmSettings = this.settingsService.getTestCaseManegementSettings()

    this.scenarioTestCaseLinkValidator = new ScenarioTestCaseLinkValidator(this.featureService, this.tcmService, this.settingsService)

    //TODO The only way I found to makes tabs exchange data is to use events api.
    this.events.subscribe('scenario:linked', (data) => {

      console.log('[Scenario Tab] event arrived:', data[0]);
      this.featureTCM = data[0]
      this.onFeatureTcmLinked()
      // this.tcmId = this.feature.getTCMId()
    })
  }

  onFeatureTcmLinked() {

    this.tcmService.findTestCases(this.featureTCM.Id).subscribe(testCases => {
      this.testCases = testCases
      this.startReporter()
    },
      error => {

        this.showToast("Error during retriving of test cases :" + error)
      })
  }

  startReporter() {

    let scenarioTestCaseLinkAsyncProcessTaskHandler = new ScenarioTestCaseLinkAsyncProcessTaskHandler(this.featureService, this.tcmService, this.settingsService)
    let asyncTaskExecutor = new AsyncTaskExecutor("Link scenario to tcm tool for feature [" + this.feature.getId + "] and tcmid[" + this.featureTCM.Id + "]", scenarioTestCaseLinkAsyncProcessTaskHandler)

    asyncTaskExecutor.setDryrun(true)

    // Add this reference to perform validation
    asyncTaskExecutor.addExecutionListener(this)

    let successCallback = <ReportCallback>(tasksreport : Array<TaskReport>) => { 
             this.events.publish('tcmsync:close',this.feature)
             }
        this.taskReporter.setProcessSuccessCallback(successCallback)
        let errorCallback = <ReportCallback>(tasksreport : Array<TaskReport>) => {  
          this.events.publish('tcmsync:close',this.feature) }
        this.taskReporter.setProcessErrorCallback(errorCallback)

    this.feature.getScenarios().forEach((scenario, index, array) => {

      asyncTaskExecutor.addTaskExecutionRequest(scenario.getSummary() + index.toString, scenario.getSummary(), { "scenario": scenario, "featureTCM": this.featureTCM, "testCases": this.testCases, "feature" :this.feature });

    });
    this.taskReporter.buildAsync(asyncTaskExecutor);


    this.taskReporter.startAsync();


  }

  showToast(message) {
    let toast = this.toastController.create({
      duration: 3000
    });
    toast.setMessage(message)
    toast.present();
  }

  beforeAsyncCheck(execution: AsyncTaskExecutor): void {
    let tasks = execution.getTasksRequest()
    tasks.forEach(taskInfo => {
      this.scenarioTestCaseLinkValidator.check(taskInfo)
    })
  }

  postAsyncCheck(execution: AsyncTaskExecutor): void { }
  beforeAsyncProcess(execution: AsyncTaskExecutor): void { }
  postAsyncProcess(execution: AsyncTaskExecutor): void { 
   
    // reload feature file from file system
      let featureWithNewTags = this.featureService.parseGherkinFile(this.feature.getFileInfo().getFileAbsolutePath())
      featureWithNewTags.setRevision(this.feature.getRevision())
      featureWithNewTags.setTestSuiteName(this.feature.getTestSuiteName())
      this.featureService.save(featureWithNewTags,(feature)=>{
        
      })
  }

}




