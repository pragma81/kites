import {TestSuite,ExecutionRuntime} from '../../models/TestSuite'
import {Injectable} from '@angular/core'


export interface TestSuiteService {
    getAll(callback:(testsuite:Array<TestSuite>)=> void): void;
    refresh();
    get(testSuiteName:string): TestSuite;
    create(testSuiteName: string, executionRuntimeType: ExecutionRuntime);
    save(testsuite: TestSuite): TestSuite;
    importFromLocalDir(projectFilePath :string, importIntoAppFolder :boolean) : TestSuite;
    imporFromSCMRepo(testSuiteDirePath:string);
    importFeatureFiles(testSuiteName:string,files: Array<string>, importIntoAppFolder :boolean,executionRuntimeType: ExecutionRuntime) : TestSuite
    listFeatureFiles(projectFilePath : string) : Array<String>
    getTestSuiteName(projectFilePath: string): string
}

