import {TaskInfo} from './TaskInfo';


export class TaskResultAction {
    // The name of the action. It may be used as name of related button
    private name : string 
   //  if true it will be executed during the bulk execution 
    private isdefault : boolean = false
    private handler : (taskInfo:TaskInfo)=>void
    private order : number

    constructor(name:string){
        this.name = name
        //Do nothing implementation
        this.handler = (taskInfo)=>{}
    }
	get Name():string{
        return this.name
    }

    set Name(value:string){
        this.name = value
    }

    isDefault():boolean{
        return this.isdefault
    }

    set Default(value:boolean){
        this.isdefault = value
    }

    get Order():number{
        return this.order
    }

    set Order(value:number){
        this.order = value
    }
    
    public execute (taskinfo:TaskInfo){
        this.handler(taskinfo)
    }
    
}