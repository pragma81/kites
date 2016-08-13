import {Injectable} from '@angular/core'
import {Scenario} from './Scenario'
import {TCMSettings} from './TCMSettings'
import {FeatureCreationError} from '../error/FeatureCreationError'
import {ErrorDetail, Severity} from '../error/ErrorDetail'

export enum FeatureType {
    API,
    UI
}

@Injectable()
export class Feature {
    private _id: string;
    private testSuiteName: string;
    private name: string;
    private description: string;
    private processId: string;
    private tcmId: string;
    private type: FeatureType;
    private fileName: string;
    private fileAbsolutePath: string;
    private rawData: Object;
    private wellFormed: boolean;
    private featureType: FeatureType;
    private scenarios: Array<Scenario> = [];
    private background: Scenario;
    private hasScenarioOutline: boolean = false;

    //Used internally for updating object using puchdb
    private _rev: string;

    //Internal AST
    private ast: string;
    constructor(featureAst: Object, testSuiteName: string, fileName: string, fileAbsolutePath: string) {
        this.rawData = featureAst;
        this.testSuiteName = testSuiteName;
        this.fileName = fileName;
        this.fileAbsolutePath = fileAbsolutePath;

        let featureAstAny: any = featureAst;
        this.name = featureAstAny.feature.name;
        this.description = featureAstAny.feature.description;
        this.buildTCMId(featureAstAny.feature.tags);
        this.buildProcessId(featureAstAny.feature.tags);
        this.buildFeatureId(featureAstAny.feature.tags);

        if (this.hasUITag(featureAstAny.feature.tags)) {
            this.type = FeatureType.UI;
        } else if (this.hasAPITag(featureAstAny.feature.tags)) {
            this.type = FeatureType.UI;
        } else throw new Error("@ui or @api tags is missing for feature [" + featureAstAny.feature.name + "]")

        if (featureAstAny.feature.children === undefined || featureAstAny.feature.children.length === 0) {
            //throw new Error("Feature [" + this.name + "] has no scenarios")
            let errorDetail = new ErrorDetail("Feature is not well formed",
                "No scenarios found",
                Severity.blocker);
            errorDetail.setResolutionHint("Add Scenario: ---- Given:--- When--- Then---- in your feature file")
            throw new FeatureCreationError("Feature [" + this.name + "] has no scenarios", new Error(), errorDetail)
        }

        featureAstAny.feature.children.forEach(element => {
            let scenario: Scenario = new Scenario(element);
            if (scenario.isBackground()) {
                this.background = scenario
            } else {
                this.scenarios.push(scenario);
            }
            if (scenario.isScenarioOutline()) {
                this.hasScenarioOutline = true;
            }
        });
    }

    public getId(): string {
        return this._id;
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getProcessId(): string {
        return this.processId;
    }

    public getTCMId(): string {
        return this.tcmId;
    }

    public getType(): FeatureType {
        return this.featureType;
    }

    public getFileName(): string {
        return this.fileName
    }

    public getFileAsolutePath() {
        return this.fileAbsolutePath;
    }

    public getScenarios(): Array<Scenario> {
        return this.scenarios;
    }

    public isUI(): boolean {
        return this.type == FeatureType.UI;
    }

    public isAPI(): boolean {
        return this.type == FeatureType.API;
    }

    public getTestSuiteName(): string {
        return this.testSuiteName;
    }

    public setTestSuiteName(value: string) {
        this.testSuiteName = value;
    }


    public getRevision(): string {
        return this._rev;
    }
    /* 
        TODO need to limit such method to be used by internal repository class only.
    */
    public setRevision(revision: string) {
        return this._rev = revision;
    }


    public getBackground(): Scenario {
        return this.background;
    }

    public getScenariosTotal(): number {
        if (this.hasScenarioOutline) {
            return this.scenarios.length - 1
        } else {
            return this.scenarios.length

        }

    }
    public getAutoScenariosTotal(): number {
        let autoScenarios: Array<Scenario> = this.scenarios.filter((value, index, array): boolean => {
            return value.isAuto();
        })
        return autoScenarios.length;
    }


    public getJson() {
        return JSON.stringify(this.rawData);
    }

    private hasUITag(featuresTags: Object[]): boolean {
        return <boolean>featuresTags.find(function (value, index, array) {
            let valueAny: any = value;
            return valueAny.name === '@ui'
        })
    }
    private hasAPITag(featuresTags: Object[]): boolean {
        return <boolean>featuresTags.find(function (value, index, array) {
            let valueAny: any = value;
            return valueAny.name === '@api'
        })

    }

    private buildTCMId(featuresTags: Object[]) {
        let tcmid = featuresTags.find(function (value, index, array) {
            let valueAny: any = value;
            let tagSplit = valueAny.name.split(':');
            return tagSplit[0] === '@jiraid'

        })
        if (tcmid === undefined)
            return undefined;
        let tcmidAny: any = tcmid;
        this.tcmId = tcmidAny.name.split(':')[1];
    }

    private buildProcessId(featuresTags: Object[]) {
        let process = featuresTags.find(function (value, index, array) {
            let valueAny: any = value;
            let tagSplit = valueAny.name.split(':');
            return tagSplit[0] === '@process'

        })
        if (process === undefined)
            return undefined;
        let processAny: any = process;
        this.processId = processAny.name.split(':')[1];
    }

    private buildFeatureId(featuresTags: Object[]) {
        let featureId = featuresTags.find(function (value, index, array) {
            let valueAny: any = value;
            let tagSplit = valueAny.name.split(':');
            return tagSplit[0] === '@featureid'

        })
        if (featureId === undefined) {
            //throw new Error('Feature id not found');
            let errorDetail = new ErrorDetail("Feature is not well formed",
                "Feature has no id",
                Severity.blocker);
            errorDetail.setResolutionHint("Use @featureid:xyz tag on top of your feature file ")

            throw new FeatureCreationError("Feature [" + this.name + "] has no id", new Error(), errorDetail)

        }
        let featureIdAny: any = featureId;
        this._id = featureIdAny.name.split(':')[1];
    }

}

