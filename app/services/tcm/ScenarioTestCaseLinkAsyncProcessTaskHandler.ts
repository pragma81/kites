import {Metric} from '../../models/Metric';
import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../error/ErrorDetail';
import {Injectable} from '@angular/core';
import {Feature} from '../../models/Feature';

import {TaskInfo, ExecutionResult} from '../task/TaskInfo';
import {AsyncTaskHandler,AsyncTaskExecutor} from '../task/AsyncTaskExecutor';
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
    check(context:any,taskInfo: TaskInfo): Observable<TaskInfo> {
        let arraySupport: Array<TaskInfo> = []
        arraySupport.push(taskInfo)
        return Observable.from(arraySupport)
    }


    process(context:any,taskInfo: TaskInfo): Observable<TaskInfo> {
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
                observer.next(this.buildTaskInfoWithError(taskInfo,error))
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
                observer.next(this.buildTaskInfoWithError(taskInfo,error))
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
                observer.next(this.buildTaskInfoWithError(taskInfo,error))
                observer.complete()
            })
        })

    }

    buildTaskInfoWithError(taskInfo : TaskInfo, error) : TaskInfo {
        let badRequestData = JSON.parse(error._body)
                let message = "Errors from server: "+badRequestData.errors.issuetype+"."
                let hint = "Please verify test case management properties (tcm) in your kites.properties configuration file."
                let errorDetail = new ErrorDetail("Test Case Creation Error.", message, Severity.blocker)
                errorDetail.setResolutionHint(hint)
                
                let errorTaskInfo = taskInfo.clone()
                errorTaskInfo.addErrorDetail(errorDetail)
                errorTaskInfo.setExecutionResult(ExecutionResult.error)
                return errorTaskInfo
    }
}