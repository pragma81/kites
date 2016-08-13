import {Injectable} from '@angular/core'


@Injectable()
export class StepDataTable {
    private header: Array<string>;
    private values: Array<Array<string>> =[];

    constructor(stepDataTablAst: Object) {
        let stepDataTablAstAny: any = stepDataTablAst;
        if (stepDataTablAstAny === undefined)
            return;

        this.header = stepDataTablAstAny.rows[0].cells;

        for (let i = 1; i < stepDataTablAstAny.rows.length; i++) {
            this.values.push(stepDataTablAstAny.rows[i].cell);
        }

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
}