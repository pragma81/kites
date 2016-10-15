import {Injectable} from '@angular/core';
import {StepDataTable} from './StepDataTable';
import {ErrorDetail, Severity} from '../error/ErrorDetail';
import {FeatureCreationError} from '../error/FeatureCreationError';

@Injectable()
export class ScenarioStep {
    private text: string;
    private dataTable: StepDataTable;
    private keyword: string;

    constructor(scenarioStepAst: Object) {
        let scenarioStepAstAny: any = scenarioStepAst;
        this.validateStep(scenarioStepAstAny)
        this.text = scenarioStepAstAny.text;
        this.keyword = scenarioStepAstAny.keyword;
        if (scenarioStepAstAny.argument) {
            this.dataTable = new StepDataTable(scenarioStepAstAny.argument);
        }

    }

    public getText(): string {
        return this.text;
    }


	public getKeyword(): string {
		return this.keyword;
	}

	public setKeyword(value: string) {
		this.keyword = value;
	}

	public getDataTable(): StepDataTable {
		return this.dataTable;
	}

	public setDataTable(value: StepDataTable) {
		this.dataTable = value;
	}
    
    public hasDataTable(): boolean {
        //TODO this raise a strange typescript error about using '<' on number O_O
        //return (this.dataTable != undefined && (this.dataTable.length > 0);
        return (this.dataTable != undefined);
    }

    public isGiven(): boolean {
        return this.keyword === 'Given';
    }

    public isWhen(): boolean {
        return this.keyword === 'When';
    }

    public isThen(): boolean {
        return this.keyword === 'Then';
    }

    public isAnd(): boolean {
        return this.keyword === 'And';
    }

    public isBut(): boolean {
        return this.keyword === 'But';
    }


     private validateStep(step: any) {
        let errorDetail = new ErrorDetail("Step is not well formed",
            "Step text is empty.",
            Severity.blocker);
        let scenarioError = new FeatureCreationError("Step is not well formed", new Error(), errorDetail)

        if (step.text === undefined 
            || step.text.length === 0) {
            errorDetail.setResolutionHint("Add some step text")
            scenarioError.Row = step.location.line - 1
            throw scenarioError
        }

        }
}