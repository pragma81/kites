
import {Injectable} from '@angular/core'
import {Feature,FileInfo} from '../../models/Feature'
import {FeatureService} from './FeatureService'
import {FeatureRepository} from '../../repository/FeatureRepository'
import {FileSystem} from '../storage/FileSystem'
import {Stats} from 'fs'

//No typings available for Gherkin. Gherkin parser will be provided at runtime.
declare var Gherkin: any;



@Injectable()
export class FeatureServiceImpl implements FeatureService {
    constructor(private featureRepository : FeatureRepository, private fileSystem: FileSystem){
    }
    public getAll(callback:(testsuite:Array<Feature>)=> void): void{}
    public getByTestSuite(testSuiteId:string, callback:(testsuite:Array<Feature>)=> void):void{
       // let filterOptions = {testSuiteName :testSuiteId}
        //this.featureRepository.query(filterOptions,callback);
        this.featureRepository.queryByTestSuiteName(testSuiteId,callback);
    }
    public findByQuery(queryOptions : Object): Array<Feature>{ return}
    public findById(id:String):Feature{return}
    public refresh(){}
    public save(feature: Feature):Feature{
        this.featureRepository.save(feature);
         console.log('Feature [' + feature.getId() + ',' + feature.getFileInfo().getFilename() + '] saved ');
         return feature
        }
    public delete(feature: Feature, callback:(feature: Feature)=> void): void {
        this.featureRepository.delete(feature,callback)
    }

    /* Return the Javascript Objec representing the feature file AST
    */
    parseGherkinFile(filepath :string):Feature {
         let featureFileData = this.fileSystem.readFile(filepath, 'utf-8');
        var parser = new Gherkin.Parser();
        parser.stopAtFirstError = false;
        let gherkinAST : Object = parser.parse(featureFileData);

        //filename 
        let pathElements: Array<string> = filepath.split(this.fileSystem.fileSeparator());
        let fileName = pathElements[pathElements.length - 1];
        
        let stats = this.fileSystem.stat(filepath);
        let fileInfo = new FileInfo(fileName,filepath,stats.birthtime,stats.mtime);
        let feature = new Feature(gherkinAST,  fileInfo);


        return feature

    }

    isOld(feature: Feature): boolean {

        let stats = this.fileSystem.stat(feature.getFileInfo().getFileAbsolutePath());
         return stats.mtime.getTime() > feature.getFileInfo().getUpdateTime().getTime()
    }

}