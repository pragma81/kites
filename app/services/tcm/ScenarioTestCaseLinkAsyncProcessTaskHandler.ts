import {Metric} from '../../models/Metric';
import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../error/ErrorDetail';
import {Injectable} from '@angular/core';
import {Feature} from '../../models/Feature';

import {TaskInfo, ExecutionResult} from '../task/TaskInfo';
import {AsyncTaskHandler, TaskExecutor} from '../task/TaskExecutor';
import {FeatureServiceImpl} from '../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../services/feature/FeatureService';
import {SettingsService} from '../settings/SettingsService'
import {TCMService} from './TCMService';
import {TestCase} from '../../models/tcm/TestCase'
import {FeatureTCM} from '../../models/tcm/FeatureTCM'
import {Scenario} from '../../models/Scenario'
import { Observable}     from 'rxjs/Observable';


import 'rxjs/add/observable/from';


/**
 * Handler for Importing feature files
 */
@Injectable()
export class ScenarioTestCaseLinkAsyncProcessTaskHandler implements AsyncTaskHandler {
    constructor(private featureService: FeatureService, private tcmService: TCMService, private settingsService: SettingsService) {
    }

    /* Simple copy check as the validation process was performed 
    * in a more performant in the before process synch method
    *
    */
    check(taskInfo: TaskInfo): Observable<TaskInfo> {
        let arraySupport: Array<TaskInfo> = []
        arraySupport.push(taskInfo)
        return Observable.from(arraySupport)
    }


    process(taskInfo: TaskInfo): Observable<TaskInfo> {
        let scenario = <Scenario>taskInfo.getInputHolder().scenario;
        let testcase = <TestCase>taskInfo.getOutputHolder().testcase
        let action = <string>taskInfo.getOutputHolder().action
        let feature = <Feature>taskInfo.getInputHolder().feature
        let featureTCM = taskInfo.getInputHolder().featureTCM

        switch (action) {
            case "create":
                return this.create(taskInfo, featureTCM, scenario, feature)
            case "update":
                return this.update(taskInfo, scenario, testcase, feature)

            case "link&update":
                return this.linkupdate(taskInfo, scenario, testcase, feature)
        }

    }


    create(taskInfo: TaskInfo, featureTCM: FeatureTCM, scenario: Scenario, feature: Feature) {
        let projectId = this.settingsService.getTestCaseManegementSettings().ProjectId

        return Observable.create(observer => {
            this.tcmService.createTestCase(scenario, projectId, featureTCM.Id, feature).subscribe(testcase => {

                //Update feature file with the scenario <--> link using tags 
                this.featureService.lyncTestCase(feature,scenario,testcase)

                let processedTaskInfo = taskInfo.clone()
                processedTaskInfo.setOutputHolder({ testcase: testcase })
                processedTaskInfo.setStatusDescription(`Test Case created with id [${testcase.Id}] and linked to feature [${featureTCM.Id}]`)
                processedTaskInfo.setExecutionResult(ExecutionResult.success)
                observer.next(processedTaskInfo)
                observer.complete()


            }, error => {
                let processedTaskInfo = taskInfo.clone()
                let errorDetail = new ErrorDetail("Test case creation error", error.message, Severity.blocker)
                processedTaskInfo.addErrorDetail(errorDetail)
                processedTaskInfo.setExecutionResult(ExecutionResult.error)
                observer.next(processedTaskInfo)
                observer.complete()
            })
        })

    }

    update(taskInfo: TaskInfo, scenario: Scenario, testcase: TestCase, feature: Feature) {
        return Observable.create(observer => {
            this.tcmService.updateTestCase(scenario, testcase, feature).subscribe(testcase => {
                let processedTaskInfo = taskInfo.clone()
                processedTaskInfo.setOutputHolder({ testcase: testcase })
                processedTaskInfo.setStatusDescription(`Test Case [${testcase.Id}] updated`)
                processedTaskInfo.setExecutionResult(ExecutionResult.success)
                observer.next(processedTaskInfo)
                observer.complete()

            }, error => {
                let processedTaskInfo = taskInfo.clone()
                let errorDetail = new ErrorDetail("Test case update error", error.message, Severity.blocker)
                processedTaskInfo.addErrorDetail(errorDetail)
                processedTaskInfo.setExecutionResult(ExecutionResult.error)
                observer.next(processedTaskInfo)
                observer.complete()
            })
        })

    }

    linkupdate(taskInfo: TaskInfo, scenario: Scenario, testcase: TestCase, feature: Feature) {
        return Observable.create(observer => {
            this.tcmService.updateTestCase(scenario, testcase, feature).subscribe(testcase => {

                //update feature file with the scenario <--> link using tags 
                this.featureService.lyncTestCase(feature,scenario,testcase)

                let processedTaskInfo = taskInfo.clone()
                processedTaskInfo.setOutputHolder({ testcase: testcase })
                processedTaskInfo.setStatusDescription(`Test Case [${testcase.Id}] updated `)
                processedTaskInfo.setExecutionResult(ExecutionResult.success)
                observer.next(processedTaskInfo)
                observer.complete()


            }, error => {
                let processedTaskInfo = taskInfo.clone()
                let errorDetail = new ErrorDetail("Test case creation error", error.message, Severity.blocker)
                processedTaskInfo.addErrorDetail(errorDetail)
                processedTaskInfo.setExecutionResult(ExecutionResult.error)
                observer.next(processedTaskInfo)
                observer.complete()
            })
        })

    }
}