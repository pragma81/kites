import {ViewController, NavParams, Events} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';
import * as path from 'path';
import {Feature} from '../../../models/Feature';
import {TaskReporter, ReportCallback, TaskReport} from '../../task/task-reporter';
import {TaskInfo, ExecutionResult} from '../../../services/task/TaskInfo';
import {TaskExecutor} from '../../../services/task/TaskExecutor';
import {AsyncTaskExecutor, AsyncExecutionListener} from '../../../services/task/AsyncTaskExecutor';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../../services/feature/FeatureService';
import {FeatureImporterTaskHandler} from '../../../services/feature/FeatureImporterTaskHandler';
import {Metric} from '../../../models/Metric';
import {ErrorWithDetails} from '../../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../../error/ErrorDetail';
import {FeatureRepository} from '../../../repository/FeatureRepository';
import {TestSuiteRepository} from '../../../repository/TestSuiteRepository';
import {FileSystem} from '../../../services/storage/FileSystem';
import {SettingsServiceImpl} from '../../../services/settings/SettingsServiceImpl';
import {AppConfig} from '../../../models/AppConfig';




@Component({
    selector: 'tex-feature-importer',
    templateUrl: 'build/components/feature/import/feature-importer.html',
    directives: [TaskReporter],
    providers: [FeatureServiceImpl, TaskReporter, FeatureRepository, FileSystem, SettingsServiceImpl,TestSuiteRepository,AppConfig]
})
export class FeatureImporter {
    private feature: Feature;
    private testSuiteName: string;
    private featureFilePath: string;
    private update: boolean;
    private featureService: FeatureService;
    @ViewChild(TaskReporter)
    private taskReporter: TaskReporter;
    constructor(private viewCtrl: ViewController, featureService: FeatureServiceImpl, private navParams: NavParams,private events: Events) {
      
        this.update = this.navParams.get("feature")
        this.featureService = featureService

        if (this.update) {
            this.feature = this.navParams.get("feature")
            if (this.feature === undefined)
                throw new Error('Update feature is requested but no feature was found in the feature importer modal')
            this.featureFilePath = this.feature.getFileInfo().getFileAbsolutePath()
            this.testSuiteName = this.feature.getTestSuiteName()
        } else {
            this.featureFilePath = this.navParams.get("filepath")
            if (this.featureFilePath === undefined)
                throw new Error('Import new feature is requested but no feature file path was found in the feature importer modal')

            this.testSuiteName = this.navParams.get("testsuitename")
            if (this.testSuiteName === undefined)
                throw new Error('Import new feature is requested but no test suite was found in the feature importer modal')
        }

    }

    ionViewDidEnter() {
        console.log('entered in feature importer')
        this.import()
    }

    private import() {
        let taskHandler = new FeatureImporterTaskHandler(this.featureService)
        let asyncTaskExecutor = new AsyncTaskExecutor("Import feature file from [" + this.featureFilePath + "]", taskHandler)
        asyncTaskExecutor.addTaskExecutionRequest(this.featureFilePath,this.featureFilePath, { "filepath": this.featureFilePath, "testSuiteName": this.testSuiteName, "oldFeature": this.feature });
        this.taskReporter.buildAsync(asyncTaskExecutor);

        let successCallback = <ReportCallback>(tasksreport : Array<TaskReport>) => { 
             this.events.publish('feature:update', this.feature);
            this.viewCtrl.dismiss() }
        this.taskReporter.setProcessSuccessCallback(successCallback)
        let errorCallback = <ReportCallback>(tasksreport : Array<TaskReport>) => { this.viewCtrl.dismiss() }
        this.taskReporter.setProcessErrorCallback(errorCallback)
        this.taskReporter.startAsync();
    }




}