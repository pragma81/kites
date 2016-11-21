import {TCMSettings} from '../../models/TCMSettings';

import {Injectable} from '@angular/core';
import {Feature, FileInfo} from '../../models/Feature';
import {FeatureService} from './FeatureService';
import {FeatureRepository} from '../../repository/FeatureRepository';
import {TestSuiteRepository} from '../../repository/TestSuiteRepository';
import {FileSystem} from '../storage/FileSystem';
import * as fs from 'fs';
import * as readline from 'readline';
import {Scenario} from '../../models/Scenario';
import {TestCase} from '../../models/tcm/TestCase';
import {SettingsService} from '../settings/SettingsService';
import {SettingsServiceImpl} from '../settings/SettingsServiceImpl';
import {ErrorWithDetails} from '../../error/ErrorWithDetails'
import {ErrorDetail, Severity} from '../../error/ErrorDetail'

//No typings available for Gherkin. Gherkin parser will be provided at runtime.
declare var Gherkin: any;

//Functiona procided at runtime by electron node integration
declare var nodeRequire: any
//var Gherkin = require('gherkin')

@Injectable()
export class FeatureServiceImpl implements FeatureService {
    private fs: any;
    private readline: any;
    private settingsService: SettingsService
    private tcmSettings: TCMSettings
    constructor(private featureRepository: FeatureRepository, 
                private fileSystem: FileSystem, settingsService: SettingsServiceImpl,
                private testSuiteRepository:TestSuiteRepository) {
        this.tcmSettings = settingsService.getTestCaseManegementSettings()
        this.fs = nodeRequire('fs');
        this.readline = nodeRequire('readline')

    }
    public getAll(callback: (testsuite: Array<Feature>) => void): void { }
    public getByTestSuite(testSuiteId: string, callback: (testsuite: Array<Feature>) => void): void {
        // let filterOptions = {testSuiteName :testSuiteId}
        //this.featureRepository.query(filterOptions,callback);
        this.featureRepository.queryByTestSuiteName(testSuiteId, callback);
    }

    public fileExists(filePath:string):boolean {
         return this.fileSystem.exists(filePath)
    }

    public exists(featureId: string, existscallback:(feature:Feature)=>void, notexistscallback:()=>void):void {
        this.featureRepository.findById(featureId,
      existscallback,
      notexistscallback
    )
    }
    public findByQuery(queryOptions: Object): Array<Feature> { return }
    public findById(id: String): Feature { return }
    public refresh() { }
    public save(feature: Feature,callback: (feature: Feature) => void): void {
        this.featureRepository.save(feature,callback);
      
    }


    public store(feature:Feature, filepath:string, text:string, callback: (feature: Feature) => void) : void{
        this.fileSystem.writeTextFile(filepath,text)
        
        let newFeature = this.parseGherkinFile(filepath)
        
        //copy 
        newFeature.setTestSuiteName(feature.getTestSuiteName())
        newFeature.setRevision(feature.getRevision())

        this.featureRepository.save(newFeature,callback)

    }

    public delete(feature: Feature, callback: (feature: Feature) => void): void {
        this.featureRepository.delete(feature, callback)
    }

   getTextFromFile(filepath:String):string{
       return this.fileSystem.readFile(filepath, 'utf-8');
   }
    
    /* Return the Javascript Object representing the feature file AST
    */
    public parseGherkinFile(filepath: string): Feature {
        let featureFileData = this.fileSystem.readFile(filepath, 'utf-8');
        var parser = new Gherkin.Parser();
        //var parser = Gherkin.Parser;
        parser.stopAtFirstError = false;
        let gherkinAST: Object = parser.parse(featureFileData);

        //filename 
        let pathElements: Array<string> = filepath.split(this.fileSystem.fileSeparator());
        let fileName = pathElements[pathElements.length - 1];

        let stats = this.fileSystem.stat(filepath);
        let fileInfo = new FileInfo(fileName, filepath, stats.birthtime, stats.mtime);
        let feature = new Feature(gherkinAST, fileInfo);


        return feature

    }

     public parseGherkinText(text: string): Feature {
        var parser = new Gherkin.Parser();

        let gherkinAST: Object = parser.parse(text);
        let feature = new Feature(gherkinAST, null);
        return feature
    }


    public lyncTestCase(feature: Feature, scenario: Scenario, testcase: TestCase): void {

        let tcmIdTag = "@" + this.tcmSettings.TagKeyword + "=" + testcase.Id
        let lineToCheck: string = scenario.getKeyword() + ": " + scenario.getSummary()
        this.replaceTagOnGherkinFile(feature.getFileInfo().getFileAbsolutePath(), lineToCheck, tcmIdTag)

    }

    isOld(feature: Feature): boolean {

        let stats = this.fileSystem.stat(feature.getFileInfo().getFileAbsolutePath());
        /*TOFIX Strange hack. At runtime i've got a string for feature.getFileInfo().getUpdateTime().
        Need to be investigate*/
        let dateString :any = feature.getFileInfo().getUpdateTime()
        return stats.mtime.getTime() > Date.parse(dateString)
    }

    private replaceTagOnGherkinFile(fileAbsolutePath: string, lineToCkeck: string, tag: string): void {
        var previuousLine = ''
        var firstline = true

        let featureFileData = this.fileSystem.readFile(fileAbsolutePath, 'utf-8');
        let lines: Array<string> = featureFileData.split('\n')
        //  const rl = this.readline.createInterface({
        //      input: this.fs.createReadStream(fileAbsolutePath)
        //  });

        lines.forEach((line, index, array) => {
            // rl.on('line', (line) => {
            var lineToTrim = line.slice(0)
            if (lineToTrim.trim() === lineToCkeck) {
                console.log('Scenario found')
                previuousLine = this.replaceTagLine(previuousLine, "@" + this.tcmSettings.TagKeyword, tag)
            }

            if (index > 0)
                previuousLine = previuousLine.concat('\n')
            try {
                this.fs.appendFileSync(fileAbsolutePath + '.temp', previuousLine)
            } catch (err) {
                let errorDetail = new ErrorDetail("Gherkin file write error", `Error while append line [${previuousLine}] for file [${fileAbsolutePath + '.temp'}]`, Severity.blocker)
                let errorWithDetail = new ErrorWithDetails("Gherkin file write error", err, errorDetail)
                throw errorWithDetail
            }

            previuousLine = line.slice(0)
            firstline = false

        })

        // rl.on('close', (line) => {
        try {
            this.fs.appendFileSync(fileAbsolutePath + '.temp', previuousLine)
        } catch (err) {
            let errorDetail = new ErrorDetail("Gherkin file write error", `Error during append last line for file [${fileAbsolutePath + '.temp'}]`, Severity.blocker)
            let errorWithDetail = new ErrorWithDetails("Gherkin file write error", err, errorDetail)
            throw errorWithDetail
        }

        //trace old file for deleting
        try {
            this.fs.renameSync(fileAbsolutePath, fileAbsolutePath + '.todelete')
        } catch (err) {
            let errorDetail = new ErrorDetail("Gherkin file rename error", `Error during rename file [${fileAbsolutePath}] for deleting`, Severity.blocker)
            let errorWithDetail = new ErrorWithDetails("Gherkin file rename error", err, errorDetail)
            throw errorWithDetail
        }

        //set the updated file as the new gherkin file
        try {
            this.fs.renameSync(fileAbsolutePath + '.temp', fileAbsolutePath)
        } catch (err) {
            let errorDetail = new ErrorDetail("Gherkin file rename error", `Error during rename file [${fileAbsolutePath}+'.temp'] as new gherkin file`, Severity.blocker)
            let errorWithDetail = new ErrorWithDetails("Gherkin file rename error", err, errorDetail)
            throw errorWithDetail
        }

        // delete old file
        try {
            this.fs.unlinkSync(fileAbsolutePath + '.todelete')
        } catch (err) {
            let errorDetail = new ErrorDetail("Gherkin file delete error", `Error while delete temporary file [${fileAbsolutePath}+'.todelete']`, Severity.blocker)
            let errorWithDetail = new ErrorWithDetails("Gherkin file delete error", err, errorDetail)
            throw errorWithDetail
        }

        // })
    }

    private replaceTagLine(line: string, tagkeyword: string, newTag: string): string {

        let tags = line.split(' ')
        tags = tags.filter((value, index, number) => {
            return !value.includes(tagkeyword)
        })

        tags.push(newTag)
        return tags.join(" ")

    }
}