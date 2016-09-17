import {Scenario} from '../../models/Scenario';
import {FeatureTCM} from '../../models/tcm/FeatureTCM';
import {TestCase} from '../../models/tcm/TestCase';
import {Feature} from '../../models/Feature';
import { Observable }     from 'rxjs/Observable';
export interface TCMService {


 /**
     * Link the feature description with a high level test case
     * @param {feature} { "filepath": <string>, "testSuiteName": <string>, "oldFeature": <Feature> }
     * @param {tcmId} the test case id
     * @return {void} 
     */  
 linkFeature(feature:Feature , tcmId:string, callback: (tcmId:string)=>void);
 
 /**
  * Find the requirement item on the test test case management tool
  */
 findFeature(tcmid:string):Observable<FeatureTCM>
 
  /**
  * Find testcases related to a specific feature on the test test case management tool
  */
 findTestCases(featureTCMId:string):Observable<Array<TestCase>>

 /**
  * Find a specific testcase related to a specific feature on the test test case management tool
  */
 findTestCaseBySummary(featureTCMId:string,testCaseSummary:string):Observable<TestCase>


 /**
  * Attach feature file to the requirement item on the test case management tool
  */
 //attachFeature(featureFilePath:string, tcmid:string):void

/**
  * Create a specific testcase related to a specific feature on the test test case management tool
  */
 createTestCase(scenario:Scenario,projectId:string,featureTCMId:string, feature:Feature):Observable<TestCase>

 updateTestCase(scenario:Scenario,testcase:TestCase, feature:Feature):Observable<TestCase>
 

 
}