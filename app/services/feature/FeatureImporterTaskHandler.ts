import {Metric} from '../../models/Metric';
import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../error/ErrorDetail';
import {Injectable} from '@angular/core';
import {Feature} from '../../models/Feature';

import {TaskInfo, ExecutionResult} from '../task/TaskInfo';
import {TaskHandler,AsyncTaskHandler, AsyncTaskExecutor} from '../task/AsyncTaskExecutor';
import {FeatureServiceImpl} from '../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../services/feature/FeatureService';
import { Observable}     from 'rxjs/Observable';


import 'rxjs/add/observable/from';


/**
 * Handler for Importing feature files
 */
@Injectable()
export class FeatureImporterTaskHandler implements AsyncTaskHandler {
    constructor(private featureService: FeatureService) {
    }

    /**
     * Check feature files are well formed according to gherkin grammar
     * @param {Object} { "filepath": <string>, "testSuiteName": <string>, "oldFeature": <Feature> }
     * @return {TaskInfo} taskInfo is updated with validation result and errors if any
     */
    check(context:any,taskInfo: TaskInfo): Observable<TaskInfo> {
        try {
            let featureFilePath = taskInfo.getInputHolder().filepath;
            let testsuitename = taskInfo.getInputHolder().testSuiteName
            let gherkinAST = this.featureService.parseGherkinFile(featureFilePath);
            let feature = new Feature(gherkinAST,testsuitename)

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

    /**
    * Save feature files after validation
    * @param {Feature} feature object is contained in TaskInfo.getOutputHolder()
    * @return {TaskInfo} taskInfo is updated with process result and errors if any
    */
    process(context:any,taskInfo: TaskInfo): Observable<TaskInfo> {
        let feature = <Feature>taskInfo.getOutputHolder()
        /*
        * If 'taskInfo.getInputHolder().oldFeature is not null, this this an update request. 
        * I need to set the _rev property for the brand new feature
        */
        if (taskInfo.getInputHolder().oldFeature != undefined)
            feature.setRevision(taskInfo.getInputHolder().oldFeature.getRevision())

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
}