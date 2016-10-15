import {Injectable} from '@angular/core';
import {ScenarioExamples} from './ScenarioExamples';
import {ScenarioStep} from './ScenarioStep';
import {FeatureCreationError} from '../error/FeatureCreationError';
import {ErrorDetail, Severity} from '../error/ErrorDetail';

export enum TestLevel {
    Smoke,
    Basic,
    Acceptance
}

@Injectable()
export class Scenario {
    private summary: string;
    private description: string;
    private keyword : string;
    private level: TestLevel
    private tcmid: string;
    private rawData: Object;
    private auto: boolean;
    private background: boolean;
    private examples: Array<ScenarioExamples> = [];
    private steps: Array<ScenarioStep> = []
    private scenarioOutline: boolean;
    private tags : Array<string> = []

    constructor(scenarioAst: Object) {
        this.rawData = scenarioAst;
        let scenarioAstAny: any = scenarioAst;
        this.validateScenario (scenarioAstAny)
        this.summary = scenarioAstAny.name;
        this.scenarioOutline = scenarioAstAny.type === 'ScenarioOutline';
        this.description = scenarioAstAny.description;
        this.keyword = scenarioAstAny.keyword;
        if (scenarioAstAny.keyword === 'Background') {
            this.background = true;
        }

        if (!this.background) {
            this.buildTCMId(scenarioAstAny.tags);
        }
        
        this.buildTags(scenarioAstAny.tags);
        this.buildExamples(scenarioAstAny.examples);
        this.buildSteps(scenarioAstAny.steps);



        if (this.findAutoTag(scenarioAstAny.tags)) {
            this.auto = true;
        }

        if (this.findSmokeTag(scenarioAstAny.tags)) {
            this.level = TestLevel.Smoke;
        }

        if (this.findBasicTag(scenarioAstAny.tags)) {
            this.level = TestLevel.Basic;
        }
        if (this.findAcceptanceTag(scenarioAstAny.tags)) {
            this.level = TestLevel.Acceptance;
        }
    }

    public getSummary(): string {
        return this.summary;
    }
    public getDescription(): string {
        return this.description;
    }

	public getKeyword(): string {
		return this.keyword;
	}

	public setKeyword(value: string) {
		this.keyword = value;
	}
    

	public getTags(): Array<string>  {
		return this.tags;
	}
    
    public getTCMId(): string {
        return this.tcmid;
    }
    public isBackground(): boolean {
        return this.background;
    }
    public getTestLevel(): TestLevel {
        return this.level;
    }

    public isAuto(): boolean {
        return this.auto;
    }

    public isSmoke(): boolean {
        return this.level === TestLevel.Smoke;
    }

    public isBasic(): boolean {
        return this.level === TestLevel.Basic;
    }

    public isAcceptance(): boolean {
        return this.level === TestLevel.Acceptance;
    }

    public isScenarioOutline() {
        return this.scenarioOutline;
    }

    public getSteps(): Array<ScenarioStep> {
        return this.steps;
    }

    public hasExamples() : boolean {
        return this.examples != undefined && this.examples.length >0
    }
    
    public getExamples(): Array<ScenarioExamples> {
        return this.examples;
    }


    //Private Methods

     private buildTags(scenarioTags: Object[]):void{
       if (scenarioTags === undefined)
            return ;
        scenarioTags.forEach((value,index ,array)=>{
             let valueAny: any = value;
            this.tags.push(<string>valueAny.name)
        })
    }

    private findAutoTag(scenarioTags: Object[]) {
        if (scenarioTags === undefined)
            return null;

        return scenarioTags.find(function (value, index, array) {
            let valueAny: any = value;
            return valueAny.name === '@auto'
        })
    }

    private findSmokeTag(scenarioTags: Object[]) {
        if (scenarioTags === undefined)
            return null;
        return scenarioTags.find(function (value, index, array) {
            let valueAny: any = value;
            return valueAny.name === '@smoke'
        })
    }
    private findBasicTag(scenarioTags: Object[]) {
        if (scenarioTags === undefined)
            return null;
        return scenarioTags.find(function (value, index, array) {
            let valueAny: any = value;
            return valueAny.name === '@basic'
        })
    }
    private findAcceptanceTag(scenarioTags: Object[]) {
        if (scenarioTags === undefined)
            return null;
        return scenarioTags.find(function (value, index, array) {
            let valueAny: any = value;
            return valueAny.name === '@acceptance'
        })
    }

    private buildTCMId(scenarioTags: Object[]) {
        if (scenarioTags === undefined)
            return null;

        let tcmid = scenarioTags.find(function (value, index, array) {
            let valueAny: any = value;
            let tagSplit = valueAny.name.split('=');
            return tagSplit[0] === '@jiraid'

        })
        if (tcmid === undefined)
            return undefined;
        let tcmidAny: any = tcmid;
        this.tcmid = tcmidAny.name.split('=')[1];
    }

    private buildExamples(examplesAst: Object[]) {
       if(examplesAst == null && this.isScenarioOutline()){
           throw new Error('Scenario ['+this.summary+'] is outline but no examples found')
       }
       if(examplesAst == null)
       return null;
        examplesAst.forEach(exampleAst=>{
           this.examples.push(new ScenarioExamples(exampleAst));
       })
        
    }

    private buildSteps(stepsAst: Object[]) {
       stepsAst.forEach(stepAst=>{
           this.steps.push(new ScenarioStep(stepAst));
       })
       
    }

     private validateScenario(scenario: any) {
        let errorDetail = new ErrorDetail("Scenario is not well formed",
            "Scenario is not well formed.",
            Severity.blocker);
        let scenarioError = new FeatureCreationError("Scenario is not well formed", new Error(), errorDetail)

        if (scenario.name === undefined 
            || scenario.name.length === 0) {
            errorDetail.setDescription("Summary is empty.")
            errorDetail.setResolutionHint("Add scenario summary.")
            scenarioError.Row = scenario.location.line - 1
            throw scenarioError
        }

        if (scenario.steps === undefined 
        || scenario.steps.length ===0) {
            errorDetail.setDescription("Scenario steps are missing.")
            errorDetail.setResolutionHint(" Add Given, When, Then statements")
            scenarioError.Row = scenario.location.line - 1
            throw scenarioError
        }

        }

       

    

}



