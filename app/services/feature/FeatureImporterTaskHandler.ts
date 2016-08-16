import {Metric} from '../../models/Metric';
import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../error/ErrorDetail';
import {Injectable} from '@angular/core';
import {Feature} from '../../models/Feature';

import {TaskInfo, ExecutionResult} from '../task/TaskInfo';
import {TaskHandler, TaskExecutor} from '../task/TaskExecutor';
import {FeatureServiceImpl} from '../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../services/feature/FeatureService';


/**
 * Handler for Importing feature files
 */
@Injectable()
export class FeatureImporterTaskHandler implements TaskHandler {
    constructor(private featureService: FeatureService) {
    }

    /**
     * Check feature files are well formed according to gherkin grammar
     * @param {Object} { "filepath": <string>, "testSuiteName": <string>, "oldFeature": <Feature> }
     * @return {TaskInfo} taskInfo is updated with validation result and errors if any
     */
    check(taskInfo: TaskInfo): TaskInfo {
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

        return taskInfo;
    }

    /**
    * Save feature files after validation
    * @param {Feature} feature object is contained in TaskInfo.getOutputHolder()
    * @return {TaskInfo} taskInfo is updated with process result and errors if any
    */
    process(taskInfo: TaskInfo): TaskInfo {
        try {
            let feature = <Feature>taskInfo.getOutputHolder()
            /*
            * If 'taskInfo.getInputHolder().oldFeature is not null, this this an update request. 
            * I need to set the _rev property for the brand new feature
            */
            if(taskInfo.getInputHolder().oldFeature != undefined)
                feature.setRevision(taskInfo.getInputHolder().oldFeature.getRevision())
            
            this.featureService.save(feature);
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
        return taskInfo
    }
}