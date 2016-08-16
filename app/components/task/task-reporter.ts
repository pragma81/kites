import {Component, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavController, Alert, AlertController} from 'ionic-angular';
import {TaskExecutor, TaskHandler, ExecutionListener, TaskExecutionListener} from '../../services/task/TaskExecutor';
import {TaskInfo, ExecutionResult,ExecutionStatus} from '../../services/task/TaskInfo';
import {Metric} from '../../models/Metric';
import {ErrorDetail} from '../../error/ErrorDetail';

export interface ReportCallback {
    message? : string
    (taskExecutor:TaskExecutor, tasksreport : Array<TaskReport>) : void
}


@Component({
    selector: 'da-task-report',
    templateUrl: 'build/components/task/task-reporter.html'
})
export class TaskReporter implements TaskExecutionListener {
    private taskExecutor: TaskExecutor;
    private hidden: boolean = true;
    private title: string;
    private processedItem: string;
    private executionCounter: number = 3;
    private tasksTotal: number = 0;
    private tasksReport: Array<TaskReport> = [];
    private successCallback: ReportCallback
    private errorCallback: ReportCallback
    private executionStatus : ExecutionStatus
    private executionResult : ExecutionResult


    constructor(private alertController: AlertController) {
        let defaultSuccessCallback = <ReportCallback> function(taskExecutor:TaskExecutor, tasksreport : Array<TaskReport>){console.log("success empty callback ")} 
        defaultSuccessCallback.message = "Operation Completed Successfully"
        this.successCallback = defaultSuccessCallback

        let defaultErrorCallback = <ReportCallback> function(taskExecutor:TaskExecutor, tasksreport : Array<TaskReport>){console.log("error empty callback ")} 
        defaultErrorCallback.message = "Operation Completed With Errors"
        this.errorCallback = defaultErrorCallback
    }

    build(taskExecutor: TaskExecutor) {
        this.taskExecutor = taskExecutor;
        this.title = taskExecutor.getTitle();
        this.tasksTotal = taskExecutor.getTasksCounter();
        taskExecutor.addTaskExecutionListener(this);
        this.tasksReport = [];

    }

    public setSuccessCallback(callback :ReportCallback){
        if(callback.message === undefined)
            callback.message = "Operation Completed Successfully"
        this.successCallback = callback
        
    }

    public setErrorCallback(callback :ReportCallback){
         if(callback.message === undefined)
            callback.message = "Operation Completed With Errors"
        this.errorCallback = callback
    }

    public isHidden(): boolean {
        return this.hidden;
    }

    public setHidden(value: boolean) {
        this.hidden = value;
    }

    public start(): void {
        this.hidden = false;
        this.taskExecutor.start();

    }


    beforeTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {
        this.processedItem = task.getSubject();

    }
    postTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {
        let taskReport: TaskReport = new TaskReport()
        taskReport.setSubject(task.getSubject())
        taskReport.setStatusDescription(task.getStatusDescription())
        taskReport.setErrorDetail(task.getErrorDetails()[0])
        taskReport.setStartTime(task.getStartTime())
        taskReport.setEndTime(task.getEndTime())
        taskReport.setMetrics(task.getMetrics())
        taskReport.setResult(task.getExecutionResult() === ExecutionResult.success ? "Success" : "Error")
        this.tasksReport.push(taskReport);
        this.executionCounter++;
        setTimeout(() => { }, 4000);
    }

    beforeTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void { }

    postTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void { }


    public showDetails(taskreport: TaskReport) {
        console.log("Task report selected: " + taskreport);
        let alert = this.alertController.create({
            title: taskreport.getErrorDetail().getSummary(),
            subTitle: taskreport.getErrorDetail().getDescription(),
            message: taskreport.getErrorDetail().getResolutionHint(),
            buttons: ['Dismiss']
        });
        alert.present();

    }

}


//Only one error detail is supported right now
export class TaskReport {
    subject: string;
    result: string;
    statusDescription: string;
    startTime: number;
    endTime: number;
    metrics: Array<Metric>;
    error: ErrorDetail;



    public getSubject(): string {
        return this.subject;
    }

    public setSubject(value: string) {
        this.subject = value;
    }

    public getResult(): string {
        return this.result;
    }

    public setResult(value: string) {
        this.result = value;
    }

    public getStatusDescription(): string {
        return this.statusDescription;
    }

    public setStatusDescription(value: string) {
        this.statusDescription = value;
    }

    public getErrorDetail(): ErrorDetail {
        return this.error;
    }

    public setErrorDetail(value: ErrorDetail) {
        this.error = value;
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


}