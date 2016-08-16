import {Feature} from '../../models/Feature'


export interface FeatureService {
    getAll(callback:(testsuite:Array<Feature>)=> void): void;
    getByTestSuite(testSuiteId:string, callback:(testsuite:Array<Feature>)=> void):void;
    findByQuery(queryOptions : Object): Array<Feature>;
    findById(id:String):Feature;
    refresh();
    save(feature: Feature):Feature;
    delete(feature: Feature, callback:(feature: Feature)=> void): void;
    parseGherkinFile(filepath :string):Feature;
    //Check if the feature file has changed since the last time it was saved
    isOld(feature: Feature): boolean;
}
