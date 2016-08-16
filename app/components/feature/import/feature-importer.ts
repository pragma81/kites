import {ViewController, NavParams} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';
import {Feature} from '../../../models/Feature';
import {TaskReporter, TaskReport} from '../../task/task-reporter';
import {TaskInfo, ExecutionResult} from '../../../services/task/TaskInfo';
import {TaskExecutor} from '../../../services/task/TaskExecutor';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../../services/feature/FeatureService';
import {FeatureImporterTaskHandler} from '../../../services/feature/FeatureImporterTaskHandler';
import {Metric} from '../../../models/Metric';
import {ErrorWithDetails} from '../../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../../error/ErrorDetail';
import {FeatureRepository} from '../../../repository/FeatureRepository';
import {FileSystem} from '../../../services/storage/FileSystem';


@Component({
    selector: 'tex-feature-importer',
    templateUrl: 'build/components/feature/import/feature-importer.html',
    directives: [TaskReporter],
    providers: [FeatureServiceImpl, TaskReporter, FeatureRepository, FileSystem]
})
export class FeatureImporter {
    private feature: Feature;
    private testSuiteName: string;
    private featureFilaPath: string;
    private update: boolean;
    private featureService: FeatureService;
    @ViewChild(TaskReporter)
    private taskReporter: TaskReporter;
    constructor(private viewCtrl: ViewController, featureService: FeatureServiceImpl, private navParams: NavParams) {
        console.log("initialize NewItemModal")
        this.update = this.navParams.get("feature")
        this.featureService = featureService

        if (this.update) {
            this.feature = this.navParams.get("feature")
            if (this.feature === undefined)
                throw new Error('Update feature is requested but no feature was found in the feature importer modal')
            this.featureFilaPath = this.feature.getFileInfo().getFileAbsolutePath()
            this.testSuiteName = this.feature.getTestSuiteName()
        } else {
            this.featureFilaPath = this.navParams.get("filepath")
            if (this.featureFilaPath === undefined)
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
        let taskExecutor = new TaskExecutor("Import feature file from [" + this.featureFilaPath + "]", taskHandler)
        taskExecutor.addTaskExecutionRequest(this.featureFilaPath, { "filepath": this.featureFilaPath, "testSuiteName": this.testSuiteName, "oldFeature": this.feature });
        this.taskReporter.build(taskExecutor);

        let successCallback = <ReportCallback>(taskExecutor:TaskExecutor, tasksreport : Array<TaskReport>) => { this.viewCtrl.dismiss(taskExecutor.isSuccess()) }
        this.taskReporter.setSuccessCallback(successCallback)
        let errorCallback = <ReportCallback>(taskExecutor:TaskExecutor, tasksreport : Array<TaskReport>) => { this.viewCtrl.dismiss(taskExecutor.isSuccess()) }
        this.taskReporter.setErrorCallback(errorCallback)
        this.taskReporter.start();
    }




}