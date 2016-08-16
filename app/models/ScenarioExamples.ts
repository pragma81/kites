import {Injectable} from '@angular/core'

@Injectable()
export class ScenarioExamples {
private description;
private header: Array<string>=[];
private values: Array<Array<string>>= [];

    constructor(examplesAst: Object) {
        let examplesAstAny: any = examplesAst;
        this.description = examplesAstAny.description;
         let headerRow : Array<Object> = examplesAstAny.tableHeader.cells;
        headerRow.forEach((cell,index,array)=>{
            let cellAny : any = cell
            this.header.push(cellAny.value)
        })


        for (let i = 0; i < examplesAstAny.tableBody.length; i++) {
             let valueRows : Array<Object> = examplesAstAny.tableBody[i].cells;
             let row : Array<string> = []
             valueRows.forEach((cell,index,array)=>{
            let cellAny : any = cell
            row.push(cellAny.value)
        })
        this.values.push(row)
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