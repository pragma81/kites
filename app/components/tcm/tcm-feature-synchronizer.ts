import { Component, ViewChild, Injector } from '@angular/core';
import { ViewController, NavParams, Tabs, Tab, Events, ToastController, Slides } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Feature } from '../../models/Feature';
import { JiraTCM } from '../../services/tcm/JiraTCM';
import { FeatureTCM } from '../../models/tcm/FeatureTCM'
import { SettingsServiceImpl } from '../../services/settings/SettingsServiceImpl'
import { AppConfig } from '../../models/AppConfig'
import { FileSystem } from '../../services/storage/FileSystem';
import { TCMService } from '../../services/tcm/TCMService';
import { TCMSettings } from '../../models/TCMSettings';
import { SettingsService } from '../../services/settings/SettingsService';
import { FeatureServiceImpl } from '../../services/feature/FeatureServiceImpl';
import { FeatureService } from '../../services/feature/FeatureService';
import { FeatureImporterTaskHandler } from '../../services/feature/FeatureImporterTaskHandler';

import { ScenarioTestCaseLinkValidator } from '../../services/tcm/ScenarioTestCaseLinkValidator';
import { ScenarioTestCaseLinkAsyncProcessTaskHandler } from '../../services/tcm/ScenarioTestCaseLinkAsyncProcessTaskHandler';
import { TestCase } from '../../models/tcm/TestCase';
import { TaskReporter, ReportCallback, TaskReport } from '../task/task-reporter';
import { TaskInfo, ExecutionResult } from '../../services/task/TaskInfo';
import { AsyncExecutionListener, AsyncTaskExecutor } from '../../services/task/AsyncTaskExecutor';



@Component({
  selector: 'tex-tcm-synchronizer',
  templateUrl: 'build/components/tcm/tcm-feature-sychronizer.html',
  directives: [TaskReporter],
  providers: [TaskReporter]
})
export class TCMFeatureSynchronizer implements AsyncExecutionListener {
  private settingsService: SettingsService
  private featureService: FeatureService
  private tcmService: TCMService

  private feature: Feature
  private isLink: boolean = true
  private isSearching: boolean = false
  private isValidated: boolean = false
  private isCheckSuccess: boolean = false
  private isProcessed: boolean = false
  private isProcessing: boolean = true

  private scenarioinput = {}

  private featureTCM: FeatureTCM
  private tcmSettings: TCMSettings

  private tcmId: string

  private headerInfo = ""
  private errorMessage = 'please enter a valid value'
  private showDetail = false
  private testCasesWarning = false
  private tcmSearchForm: FormGroup;

  private testCases: Array<TestCase> = []
  private scenarioTestCaseLinkValidator: ScenarioTestCaseLinkValidator

  @ViewChild('wizard')
  private slider: Slides;

  @ViewChild(TaskReporter)
  private taskReporter: TaskReporter;

  constructor(public viewCtrl: ViewController, private navParams: NavParams,
    private events: Events, injector: Injector,
    settingsService: SettingsServiceImpl,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    featureService: FeatureServiceImpl) {

    this.featureService = featureService
    this.settingsService = settingsService
    this.tcmSettings = this.settingsService.getTestCaseManegementSettings()
    this.headerInfo = "Syncronize feature file with an existing " + this.tcmSettings.TcmName + " issue."

    console.log("initialize TCMFeatureSynchronizer ")
    this.feature = this.navParams.get("feature")
    console.log("Passed params", navParams.data);

    this.tcmService = injector.get(JiraTCM)

    this.tcmId = this.feature.getTCMId()
    this.tcmSearchForm = formBuilder.group({
      tcmId: ['', Validators.compose([Validators.maxLength(30), Validators.pattern('([A-Z]{3,}-[1-9]+[0-9]*)'), Validators.required])]
    });

    (<FormControl>this.tcmSearchForm.controls['tcmId']).updateValue(this.tcmId)

    if (this.tcmId) {
      this.isSearching = true
      this.tcmService.findFeature(this.tcmId)
        .subscribe(
        featureTCM => {
          this.isSearching = false
          this.featureTCM = featureTCM
          if (featureTCM.TestCases.length != this.feature.getScenarios().length)
            this.testCasesWarning = true
        },
        error => {
          this.isSearching = false
          if (error.status === 404)
          this.showToast(this.tcmId + ' not found in ' + this.tcmSettings.TcmName)
        }

        )
    }
    this.scenarioTestCaseLinkValidator = new ScenarioTestCaseLinkValidator(this.featureService, this.tcmService, this.settingsService)
  }

  //feature slide events
  onFeatureIdChanged() {
    this.featureTCM = undefined
  }

  public search() {
    this.featureTCM = undefined
    this.testCasesWarning = false
    if (!this.tcmSearchForm.valid)
      return

    this.isSearching = true
    this.tcmService.findFeature(this.tcmSearchForm.controls['tcmId'].value)
      .subscribe(featureTCM => {
        this.featureTCM = featureTCM
        this.isSearching = false
        if (featureTCM.TestCases.length != this.feature.getScenarios().length)
          this.testCasesWarning = true
      },
      error => {
        this.isSearching = false
        if (error.status === 404)
          this.showToast(this.tcmSearchForm.controls['tcmId'].value + ' not found in ' + this.tcmSettings.TcmName)
      }
      )
  }


  showToast(message) {
    let toast = this.toastController.create({
      duration: 3000
    });
    toast.setMessage(message)
    toast.present();
  }

  expandDetail() {
    this.showDetail = !this.showDetail
  }

  // Feature sync events
  public onFeatureLinked(featureTcm) {

    //Save the new featureTCM in the feature repository and in the feature file
    //call featureServiceImpl.linkFeatureTCM(feature,featureTCM) 
    //1) update file with new service which use nodejs readline
    // 2)update database: featureService.parsegherkin(featurefile), featureservice.save(feature) 
    this.scenarioinput = { feature: this.feature, featureTCM: featureTcm }
    // this.tcmTabs.select(1)

    this.events.publish('scenario:linked', featureTcm)

  }

  validate() {
    
    this.slider.slideNext()
    //Start feature sync validation process
    // this.importTestSuite()
    this.isLink = false
    this.headerInfo = "Validate results are shown below"

    this.tcmService.findTestCases(this.featureTCM.Id).subscribe(testCases => {
      this.testCases = testCases
      this.isProcessing = true
      this.startReporter()
    },
      error => {

        this.showToast("Error during retriving of test cases :" + error)
      })
  }

  process(){
    this.isProcessing = true
    this.taskReporter.startAsync()
  }

  startReporter() {

    let scenarioTestCaseLinkAsyncProcessTaskHandler = new ScenarioTestCaseLinkAsyncProcessTaskHandler(this.featureService, this.tcmService, this.settingsService)
    let asyncTaskExecutor = new AsyncTaskExecutor("Link scenario to tcm tool for feature [" + this.feature.getId + "] and tcmid[" + this.featureTCM.Id + "]", scenarioTestCaseLinkAsyncProcessTaskHandler)

    asyncTaskExecutor.setDryrun(true)

    // Add this reference to perform validation
    asyncTaskExecutor.addExecutionListener(this)

    /*
        let successCallback = <ReportCallback>(tasksreport : Array<TaskReport>) => { 
                 this.events.publish('tcmsync:close',this.feature)
                 }
            this.taskReporter.setProcessSuccessCallback(successCallback)
            let errorCallback = <ReportCallback>(tasksreport : Array<TaskReport>) => {  
              this.events.publish('tcmsync:close',this.feature) }
            this.taskReporter.setProcessErrorCallback(errorCallback)
    */
    this.feature.getScenarios().forEach((scenario, index, array) => {

      asyncTaskExecutor.addTaskExecutionRequest(scenario.getSummary() + index.toString, scenario.getSummary(), { "scenario": scenario, "featureTCM": this.featureTCM, "testCases": this.testCases, "feature": this.feature });

    });
    this.taskReporter.buildAsync(asyncTaskExecutor);


    this.taskReporter.startAsync();


  }

  beforeAsyncCheck(execution: AsyncTaskExecutor): void {
    let tasks = execution.getTasksRequest()
    tasks.forEach(taskInfo => {
      this.scenarioTestCaseLinkValidator.check(taskInfo)
    })
  }

  postAsyncCheck(execution: AsyncTaskExecutor): void {
    this.isValidated = true
    this.isProcessing = false
    if (execution.getResult() === ExecutionResult.success) {
      this.isCheckSuccess = true
      this.headerInfo = "Successfully validated "+ execution.getTasksCounter()+ " test scenarios."  
    }
    else {
      this.isCheckSuccess = false
      this.headerInfo = "Error while validating "+ execution.getTasksCounter()+ " test scenarios. See below for errors detail."  
    }
  }
  beforeAsyncProcess(execution: AsyncTaskExecutor): void { }
  postAsyncProcess(execution: AsyncTaskExecutor): void {
    this.isProcessed = true
    this.isProcessing = false
    
    if (execution.getResult() === ExecutionResult.success) {
      this.isCheckSuccess = true
       this.headerInfo = "Successfully processed "+ execution.getTasksCounter()+ " test scenarios."  
    }
    else {
      this.isCheckSuccess = false
      this.headerInfo = "Error while processing "+ execution.getTasksCounter()+ " test scenarios. See below for errors detail."  
      
  }

    if (this.isCheckSuccess) {
      // reload feature file from file system and save new tcm tags
      let updatedGherkinAST = this.featureService.parseGherkinFile(this.feature.getFileInfo().getFileAbsolutePath())
      let featureWithNewTags = new Feature(updatedGherkinAST, this.feature.getTestSuiteName(), this.feature.getFileInfo())
      featureWithNewTags.setRevision(this.feature.getRevision())

      this.featureService.save(featureWithNewTags, (feature) => {
        this.feature = feature
      })
    }
  }

  //Slide events
  back() {
    this.slider.slidePrev()
    this.isLink = true
    this.isProcessed = false
    this.isValidated = false
  }

  
  close() {
    this.viewCtrl.dismiss().then(() => {
       this.events.publish("feature:update",this.feature)
    })
  }


}