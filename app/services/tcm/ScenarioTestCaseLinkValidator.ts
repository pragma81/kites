import {Metric} from '../../models/Metric';
import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail, Severity} from '../../error/ErrorDetail';
import {Injectable} from '@angular/core';
import {Feature} from '../../models/Feature';

import {TaskInfo, ExecutionResult} from '../task/TaskInfo';
import {TaskHandler, TaskExecutor} from '../task/TaskExecutor';
import {FeatureServiceImpl} from '../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../services/feature/FeatureService';
import {SettingsService} from '../settings/SettingsService'
import {TCMService} from './TCMService';
import {TestCase} from '../../models/tcm/TestCase'
import {FeatureTCM} from '../../models/tcm/FeatureTCM'
import {Scenario} from '../../models/Scenario'


/**
 * Handler for Importing feature files
 */
@Injectable()
export class ScenarioTestCaseLinkValidator  {
    constructor(private featureService: FeatureService, private tcmService: TCMService, private settingsService:SettingsService) {
    }

    
    check(taskInfo: TaskInfo): TaskInfo {
        try {
            let scenario = <Scenario>taskInfo.getInputHolder().scenario;
            let testCases = <Array<TestCase>>taskInfo.getInputHolder().testCases
            
            if (!scenario.getTCMId() || scenario.getTCMId().length === 0) {
                //Scenario never synched with tcm before
                let testCase = testCases.find((testCase, index, array) => {
                    return testCase.Summary === scenario.getSummary()
                })
                if (testCase) {
                    //warning feature file scenario not linked but test case already created in tcm 
                    taskInfo.setStatusDescription(`feature file scenario not linked but test case already created in tcm with id [${testCase.Id}]. Default action will link feature file scenario and update test case description `)
                    taskInfo.setExecutionResult(ExecutionResult.warning);
                    taskInfo.setOutputHolder({testcase : testCase, action : "link&update"})
                } else {
                    //success scenario not linked in feature file and never created in tcm
                    taskInfo.setStatusDescription("scenario not linked in feature file and never created in tcm. Default action will create a new test case")
                    taskInfo.setExecutionResult(ExecutionResult.success);
                    taskInfo.setOutputHolder({testcase : testCase, action : "create"})
                }

            } else {
                //Scenario already linked to tcm
                let testCase = testCases.find((testCase, index, array) => {
                    return testCase.Id === scenario.getTCMId()
                })


                if (testCase) {

                    if (testCase.Summary === scenario.getSummary()) {
                        //Success Feature file scenario and test case synched correctly
                        taskInfo.setStatusDescription("Feature file scenario and test case synched correctly. Default action will update test case description")
                        taskInfo.setExecutionResult(ExecutionResult.success);
                        taskInfo.setOutputHolder({testcase : testCase, action : "update"})
                    } else {
                        //Warning Feature file scenario is synched with test case but the test case summary differs
                        taskInfo.setStatusDescription(`Feature file scenario and test case synched correctly on id [${testCase.Id}] but the test case summary differs. Default action will update test case summary and description`)
                        taskInfo.setExecutionResult(ExecutionResult.warning);
                        taskInfo.setOutputHolder({testcase : testCase, action : "update"})
                    }
                } else {
                    //Error Feature file scenario has test case id but it was not found on tcm
                        let errorMessage = `Feature file scenario has test case id [${scenario.getTCMId()}]but it was not found on tcm. No automatic default action available.`
                        taskInfo.setStatusDescription(errorMessage)
                        taskInfo.setExecutionResult(ExecutionResult.error);
                        let error = new ErrorDetail("TCM synch Error", errorMessage, Severity.blocker)
                        taskInfo.addErrorDetail(error)
                }
            }
            
           
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


}