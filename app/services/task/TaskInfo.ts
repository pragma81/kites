import {ErrorWithDetails} from '../../error/ErrorWithDetails';
import {ErrorDetail} from '../../error/ErrorDetail';
import {Metric} from '../../models/Metric';
import {TaskResultAction} from './TaskAction';

export class TaskInfo {
    private id: string
    private subject: string;
    private executionResult: ExecutionResult;
    private statusDescription: string;
    private errors : Array<ErrorDetail>=[]
    private startTime: number;
    private endTime: number;
    private metrics: Array<Metric>;
    private inputHolder: any;
    private outputHolder: any;

    private resultActions : Array<TaskResultAction> = []


    constructor(id:string,subject: string, inputHolder: any) {
        this.id = id
        this.subject = subject;
        this.inputHolder = inputHolder;
    }


    get Id ():string {
        return this.id
    }
    addErrorDetail(error:ErrorDetail){
        this.errors.push(error)
    }
    
    addResultAction(resultAction: TaskResultAction){
        this.resultActions.push(resultAction)
    }

    get ResultActions(): Array<TaskResultAction> {
        return this.resultActions
    }

    public getSubject(): string {
        return this.subject;
    }

    public setSubject(value: string) {
        this.subject = value;
    }

    public getExecutionResult(): ExecutionResult {
        return this.executionResult;
    }

    public setExecutionResult(value: ExecutionResult) {
        this.executionResult = value;
    }


    public getStatusDescription(): string {
        return this.statusDescription;
    }

    public setStatusDescription(value: string) {
        this.statusDescription = value;
    }

    public getErrorDetails(): Array<ErrorDetail> {
        return this.errors;
    }


    public getInputHolder(): any {
        return this.inputHolder;
    }


	public getOutputHolder(): any {
		return this.outputHolder;
	}

	public setOutputHolder(value: any) {
		this.outputHolder = value;
	}


    public getStartTime(): number {
        return this.startTime;
    }

    public setStartTime(value: number) {
        this.startTime = value;
    }

    public getEndTime(): number {
        return this.endTime;
    }

    public setEndTime(value: number) {
        this.endTime = value;
    }

    public setMetrics(metrics: Array<Metric>) {
        this.metrics = metrics;
    }
    public getMetrics() {
        return this.metrics;
    }

    public clone():TaskInfo {
        let taskInfo = new TaskInfo(this.id,this.subject,this.inputHolder)
        taskInfo.setEndTime(this.getEndTime())
        taskInfo.setStartTime(this.getStartTime())
        taskInfo.setOutputHolder(this.getOutputHolder())
        taskInfo.setStatusDescription(this.getStatusDescription())
        taskInfo.setMetrics(this.metrics)
        taskInfo.setExecutionResult(this.executionResult)

        return taskInfo
    }

}

export enum ExecutionStatus {
    compiling,
    validating,
    validated,
    processing,
    processed
}

export enum ExecutionResult {
    error,
    warning,
    success
}

