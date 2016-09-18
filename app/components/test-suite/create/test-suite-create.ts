import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import {Slides, NavController, NavParams, ViewController, ModalController,Events} from 'ionic-angular';
import {FileSystem} from '../../../services/storage/FileSystem';
import {TestSuite} from '../../../models/TestSuite';
import {SettingsService} from '../../../services/settings/SettingsService'
import {SettingsServiceImpl} from '../../../services/settings/SettingsServiceImpl'
import {AppConfig} from '../../../models/AppConfig';
import {TestSuiteService} from '../../../services/testsuite/TestSuiteService'
import {TestSuiteServiceImpl} from '../../../services/testsuite/TestSuiteServiceImpl'
import {GherkinService} from '../../../services/gherkin/GherkinService';
import {TestSuiteRepository} from '../../../repository/TestSuiteRepository';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl'
import {FeatureRepository} from '../../../repository/FeatureRepository';
import {TestSuiteImporter} from '../import/test-suite-importer';
import {JavaAutomationService} from '../../../services/automation/JavaAutomationService'
import {ExecutionRuntime} from '../../../services/automation/AutomationService'
import {Feature} from '../../../models/Feature';



@Component({
    templateUrl: 'build/components/test-suite/create/test-suite-create.html',
    providers: [FileSystem, AppConfig,
        SettingsServiceImpl, TestSuiteServiceImpl,
        TestSuiteRepository, GherkinService,
        FeatureServiceImpl, FeatureRepository,
        JavaAutomationService]
})
export class TestSuiteCreate {

    private testsuiteName: string
    private workspacepath: string
    private workspace: string
    private settingsService: SettingsService
    private testSuiteService: TestSuiteService
    private auto:boolean = false
    private executionRuntime : ExecutionRuntime
    private error: string = 'Please insert a valid name'
    private testSuiteForm: FormGroup;


    constructor(private viewCtrl: ViewController, settingsService: SettingsServiceImpl,
        private modalCtrl: ModalController, testSuiteService: TestSuiteServiceImpl,
        private formBuilder: FormBuilder,
        private fileSystem: FileSystem,
        private events:Events) {
        this.settingsService = settingsService
        this.testSuiteService = testSuiteService
        this.workspace = this.settingsService.getAppSettings().WorkspaceHome

        this.testSuiteForm = formBuilder.group({
            name: ['', Validators.compose([Validators.minLength(5), Validators.required,this.validateTestSuiteName.bind(this)])],
            workspace: [''],
            auto:[''],
            langs:['']
        });
        
        (<FormControl>this.testSuiteForm.controls['workspace']).updateValue(this.workspace)
    }
   
    validateTestSuiteName(c: FormControl) {
    this.workspacepath = this.workspace + this.fileSystem.fileSeparator() + c.value
    let result = this.testSuiteService.folderExists(this.workspacepath) ? {
        validateTestSuiteName : {
            valid: false
        }
    }:null

    return result
  }


   


    public onTestSuiteNameChanged() {
        this.testsuiteName = this.testSuiteForm.controls['name'].value
        this.workspacepath = this.workspace + this.fileSystem.fileSeparator() + this.testsuiteName
        let workspaceControl = <FormControl>this.testSuiteForm.controls['workspace']
        workspaceControl.updateValue(this.workspacepath)

    }

    public dismiss() {
        this.viewCtrl.dismiss()
    }

    public setExecutionRuntime(){
         let language = this.testSuiteForm.controls['langs'].value
         switch (language){
             case 'java' : this.executionRuntime = ExecutionRuntime.JAVA
             break
             default : this.executionRuntime = ExecutionRuntime.JAVA
         }
    }
    /*
    changeAuto(){
         let autoControl = <FormControl>this.testSuiteForm.controls['auto']
        if(autoControl.value){
            this.auto = true
        } else {
            this.auto = false
        }
    }
    */

    jumpToImport() {
        this.viewCtrl.dismiss().then(() => {
            const modal = this.modalCtrl.create(TestSuiteImporter);
            modal.present()
        })

    }

    public create(){
       this.viewCtrl.dismiss().then(()=>{
       let testSuite = this.testSuiteService.create(this.testsuiteName,this.workspacepath,this.executionRuntime)
           this.events.publish('testsuite:create',testSuite)
       })
        
    }



}