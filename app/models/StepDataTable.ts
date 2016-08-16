import {Injectable} from '@angular/core'


@Injectable()
export class StepDataTable {
    private header: Array<string>=[];
    private values: Array<Array<string>> =[];

    constructor(stepDataTablAst: Object) {
        let stepDataTablAstAny: any = stepDataTablAst;
        if (stepDataTablAstAny === undefined)
            return;

        let headerRow : Array<Object> = stepDataTablAstAny.rows[0].cells;
        headerRow.forEach((cell,index,array)=>{
            let cellAny : any = cell
            this.header.push(cellAny.value)
        })


        for (let i = 1; i < stepDataTablAstAny.rows.length; i++) {
             let valueRows : Array<Object> = stepDataTablAstAny.rows[i].cells;
             let row : Array<string> = []
             valueRows.forEach((cell,index,array)=>{
            let cellAny : any = cell
            row.push(cellAny.value)
        })
        this.values.push(row)
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