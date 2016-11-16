import {Injectable} from '@angular/core'
import {TestSuite} from '../../models/TestSuite';
import {ExecutionRuntime} from '../automation/AutomationService';



export interface TestSuiteService {
    getAll(callback:(testsuite:Array<TestSuite>)=> void): void;
    refresh();
    folderExists(testsuiteFolderPath:string):boolean
    exists(testSuiteName: string, existscallback:(testsuite:TestSuite)=>void, notexistscallback:()=>void):void
    get(testSuiteName:string): TestSuite;
    create(testSuiteName: string, testSuiteFolderPath:string, executionRuntimeType: ExecutionRuntime):void;
    save(testsuite: TestSuite,callback:(testsuite:TestSuite)=> void): void;
    delete(testsuite: TestSuite, callback:(testsuite:TestSuite)=> void): void;
    importFromLocalDir(projectFilePath :string, importIntoAppFolder :boolean) :void;
    imporFromSCMRepo(testSuiteDirePath:string);
    importFeatureFiles(testSuiteName:string,files: Array<string>, importIntoAppFolder :boolean,executionRuntimeType: ExecutionRuntime) : TestSuite
    listFeatureFiles(projectFilePath : string) : Array<String>
    getTestSuiteName(projectFilePath: string): string
}

