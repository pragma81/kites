import {Injectable} from '@angular/core';
import {ExecutionRuntime} from '../services/automation/AutomationService';
import {Feature} from './Feature';


@Injectable()
export class TestSuite {
    private _id: string;
    private name: string;
    private scmSync: boolean;
    private features: number = 0;
    private uiTests: number = 0;
    private apiTests: number = 0;

    private projectFilePath: string;
    private imported: boolean;

    private testSuiteRepoName: string;
    private executionRuntimeType: ExecutionRuntime;
    private testSuiteFolderPath: string

    //Used internally for updating object using puchdb
    private _rev: string;

    constructor(name: string, scmSync: boolean,
        testSuiteRepoName: string,
        testSuiteFolderPath: string,
        imported: boolean,
        projectFilePath: string,
        executionRuntimeType: ExecutionRuntime) {
        //TODO to check if using technical id coming from database.
        this._id = name;
        this.name = name;
        //Execution runtime oneleo only supported.
        this.executionRuntimeType = ExecutionRuntime.JAVA;
        this.scmSync = scmSync;
        this.projectFilePath = projectFilePath;
        this.testSuiteRepoName = testSuiteRepoName;
        this.imported = imported;
        this.testSuiteFolderPath = testSuiteFolderPath
    }

    public getId(): string {
        return this._id;
    }
    public getName(): string {
        return this.name;
    }
    public isScmSync(): boolean {
        return this.scmSync;
    }
    public getFeatures(): number {
        return this.features;
    }
    public getUiTests(): number {
        return this.uiTests;
    }
    public getAPITests(): number {
        return this.apiTests;
    }

    public getProjectFilePath(): string {
        return this.projectFilePath;
    }

    public getTestSuiteRepoName(): string {
        return this.testSuiteRepoName;
    }

    public get TestSuiteDir(): string {
        if (this.testSuiteFolderPath)
            return this.testSuiteFolderPath

        let endIndex = this.projectFilePath.length - this.ProjectFileName.length;
        return this.projectFilePath.substring(0, endIndex);
    }

    public get ProjectFileName(): string {
        let projectFileName = this.getName() + '.project'
        return projectFileName
    }

    public getRevision(): string {
        return this._rev;
    }

    public setFeatures(value: number) {
        this.features = value;
    }

    public setApiTests(value: number) {
        this.apiTests = value;
    }

    public setUiTests(value: number) {
        this.uiTests = value;
    }

    /* 
        TODO need to limit such method to be used by internal repository class only.
    */
    public setRevision(revision: string) {
        return this._rev = revision;
    }

    public incrementApiTestCounter() {
        this.apiTests++;
    }

    public incrementUiTestCounter() {
        this.uiTests++;
    }

    public incrementFeaturesCounter() {
        this.features++;
    }

    public getJson() {
        return JSON.stringify(this);
    }
}

