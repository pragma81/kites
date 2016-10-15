import {Injectable} from '@angular/core';
import {FeatureCreationError} from '../error/FeatureCreationError';
import {ErrorDetail, Severity} from '../error/ErrorDetail';

@Injectable()
export class ScenarioExamples {
    private description;
    private header: Array<string> = [];
    private values: Array<Array<string>> = [];

    constructor(examplesAst: Object) {
        let examplesAstAny: any = examplesAst;
        this.description = examplesAstAny.description;
        this.validateTable(examplesAstAny)
        let headerRow: Array<Object> = examplesAstAny.tableHeader.cells;
        headerRow.forEach((cell, index, array) => {
            let cellAny: any = cell
            this.header.push(cellAny.value)
        })


        for (let i = 0; i < examplesAstAny.tableBody.length; i++) {
            let valueRows: Array<Object> = examplesAstAny.tableBody[i].cells;
            let row: Array<string> = []
            valueRows.forEach((cell, index, array) => {
                let cellAny: any = cell
                row.push(cellAny.value)
            })
            this.values.push(row)
        }

    }

    public getDescriptio(): string {
        return this.description;
    }
    public getHeader(): Array<string> {
        return this.header;
    }
    public getValues(): Array<Array<string>> {
        return this.values;
    }
    public getValuesRow(index: number): Array<string> {
        return this.values[index];
    }
    public length(): number {
        return this.header.length;
    }

    private validateTable(examplesTable: any) {
        let errorDetail = new ErrorDetail("Examples table is not well formed",
            "No values found for Examples table.",
            Severity.blocker);
        let examplesTableError = new FeatureCreationError("Examples table is not well formed", new Error(), errorDetail)

        if (examplesTable.tableHeader === undefined 
        || examplesTable.tableHeader.cells === undefined 
        || examplesTable.tableHeader.cells.length === 0) {
            errorDetail.setResolutionHint("Add examples table headers. e.g. |header1 |header2| ")
            examplesTableError.Row = examplesTable.location.line - 1
            throw examplesTableError
        }

        if (examplesTable.tableBody === undefined 
        || examplesTable.tableBody.length ===0) {
            errorDetail.setResolutionHint("Add examples table values. e.g. |value1 |value2| ")
            examplesTableError.Row = examplesTable.location.line - 1
            throw examplesTableError
        }

    }

}