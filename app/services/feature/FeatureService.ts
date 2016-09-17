import {Scenario} from '../../models/Scenario';
import {TestCase} from '../../models/tcm/TestCase';
import {Feature} from '../../models/Feature';


export interface FeatureService {
    getAll(callback:(features:Array<Feature>)=> void): void;
    getByTestSuite(testSuiteId:string, callback:(feature:Array<Feature>)=> void):void;
    findByQuery(queryOptions : Object): Array<Feature>;
    findById(id:String):Feature;
    getTextFromFile(filepath:String):string
    refresh();
    //Save the feature model into the database
    save(feature: Feature,callback:(feature:Feature)=> void):void;
    
    //Save the feature file text into the file system and the mdodel into the database
    store(feature:Feature,filepath :string, text:string, callback:(feature:Feature)=> void):void;
    delete(feature: Feature, callback:(feature: Feature)=> void): void;
    parseGherkinFile(filepath :string):Feature;
    parseGherkinText(text : string): Feature;
    //Check if the feature file has changed since the last time it was saved
    isOld(feature: Feature): boolean;
    lyncTestCase(feature : Feature, scenario : Scenario, testcase : TestCase) : void
}
