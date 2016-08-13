import {Injectable} from '@angular/core'

@Injectable()
export class ScenarioExamples {
private description;
private header: Array<string>;
private values: Array<Array<string>>= [];

    constructor(examplesAst: Object) {
        let examplesAstAny: any = examplesAst;
        this.description = examplesAstAny.description;
        this.header = examplesAstAny.tableHeader.cells;

        for (let i = 1; i < examplesAstAny.tableBody.length; i++) {
            this.values.push(examplesAstAny.tableBody[i].cells);
        }

    }

    public getDescriptio():string {
        return this.description;
    }
    public getHeader(): Array<string>{
        return this.header;
    }
     public getValues(): Array<Array<string>> { 
        return this.values;
    }
    public getValuesRow(index : number) : Array<string>{
        return this.values[index];
    }


    public length():number{
        return this.header.length;
    }


}