import {Component, Input, Output, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavController, Alert, AlertController} from 'ionic-angular';
import {TaskExecutor, TaskHandler, ExecutionListener,TaskExecutionListener} from '../../services/task/TaskExecutor';
import {AsyncTaskExecutor, AsyncExecutionListener} from '../../services/task/AsyncTaskExecutor';
import {TaskInfo, ExecutionResult, ExecutionStatus} from '../../services/task/TaskInfo';
import {Metric} from '../../models/Metric';
import {ErrorDetail} from '../../error/ErrorDetail';

export interface ReportCallback {
    message?: string
    (tasksreport: Array<TaskReport>): void
}


@Component({
    selector: 'da-task-report',
    templateUrl: 'build/components/task/task-reporter.html'
})
export class TaskReporter implements TaskExecutionListener, AsyncExecutionListener , ExecutionListener{
    private taskExecutor: TaskExecutor;
    private asynctaskExecutor: AsyncTaskExecutor;
    private hidden: boolean = true;
    private title: string;
    private processedItem: string;
    private executionCounter: number = 3;
    private tasksTotal: number = 0;
    private tasksReport: Array<TaskReport> = [];
    private processSuccessCallback: ReportCallback
    private processErrorCallback: ReportCallback
    private validationSuccessCallback: ReportCallback
    private validationErrorCallback: ReportCallback
    private executionStatus: ExecutionStatus
    private executionResult: ExecutionResult
    @Input() showActions : boolean = true ;



    constructor(private alertController: AlertController) {
        let defaultSuccessCallback = <ReportCallback>function (tasksreport: Array<TaskReport>) { console.log("success empty callback ") }
        defaultSuccessCallback.message = "Operation Completed Successfully"
        this.processSuccessCallback = defaultSuccessCallback

        let defaultErrorCallback = <ReportCallback>function (tasksreport: Array<TaskReport>) { console.log("error empty callback ") }
        defaultErrorCallback.message = "Operation Completed With Errors"
        this.processErrorCallback = defaultErrorCallback

        let defaultValidationSuccessCallback = <ReportCallback>function (tasksreport: Array<TaskReport>) {
            if (this.taskExecutor) {
                this.start()
            }
            else if (this.asynctaskExecutor) {
                this.startAsync()
            }

        }
        defaultValidationSuccessCallback.message = "Process all validated requests"
        this.validationSuccessCallback = defaultValidationSuccessCallback

        let defaultValidationErrorCallback = <ReportCallback>function (tasksreport: Array<TaskReport>) { console.log("error empty callback ") }
        defaultValidationErrorCallback.message = "Validation Completed With Errors"
        this.validationErrorCallback = defaultValidationErrorCallback
    }

    build(taskExecutor: TaskExecutor) {
        this.taskExecutor = taskExecutor;
        this.title = taskExecutor.getTitle();
        this.tasksTotal = taskExecutor.getTasksCounter();
        taskExecutor.addTaskExecutionListener(this);
        taskExecutor.addExecutionListener(this);

        this.tasksReport = [];

    }

    buildAsync(asynctaskExecutor: AsyncTaskExecutor) {
        this.asynctaskExecutor = asynctaskExecutor;
        this.title = asynctaskExecutor.getTitle();
        this.tasksTotal = asynctaskExecutor.getTasksCounter();
        asynctaskExecutor.addTaskExecutionListener(this);
        asynctaskExecutor.addExecutionListener(this);
        this.tasksReport = [];

    }

    public setValidationSuccessCallback(callback: ReportCallback) {
        if (callback.message === undefined)
            callback.message = "Process all validated requests"
        this.validationSuccessCallback = callback

    }

    public setValidationErrorCallback(callback: ReportCallback) {
        if (callback.message === undefined)
            callback.message = "Validation Completed With Errors"
        this.validationErrorCallback = callback
    }

    public setProcessSuccessCallback(callback: ReportCallback) {
        if (callback.message === undefined)
            callback.message = "Operation Completed Successfully"
        this.processSuccessCallback = callback

    }

    public setProcessErrorCallback(callback: ReportCallback) {
        if (callback.message === undefined)
            callback.message = "Operation Completed With Errors"
        this.processErrorCallback = callback
    }

    public isHidden(): boolean {
        return this.hidden;
    }

    public setHidden(value: boolean) {
        this.hidden = value;
    }

    public start(): void {
        this.hidden = false;

        // reset task reports
        this.tasksReport = []
        let bulkExecutionResult = this.taskExecutor.start();
        this.executionStatus = bulkExecutionResult.Status
        this.executionResult = bulkExecutionResult.Result

    }

    public startAsync(): void {
        this.hidden = false;

        // reset task reports
        this.tasksReport = []
        this.asynctaskExecutor.start();

    }


   

    public isValidated(): boolean {
       
        return (this.executionStatus === ExecutionStatus.validated)
    }

    public isProcessed(): boolean {
         
        return (this.executionStatus === ExecutionStatus.processed)
    }

    public isSuccess(): boolean {
        return (this.executionResult === ExecutionResult.success)
    }

    public isWarning(): boolean {
        return (this.executionResult === ExecutionResult.warning)
    }

    public isError(): boolean {
        return (this.executionResult === ExecutionResult.error)
    }

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

    public executeTaskAction(taskReport: TaskReport, action: string) {
        this.taskExecutor.executeTaskResultAction(taskReport.Id, action)
    }

    buildTaskReport(task: TaskInfo): TaskReport {
        let taskReport: TaskReport = new TaskReport()
        taskReport.Id = task.Id
        taskReport.setSubject(task.getSubject())
        taskReport.setStatusDescription(task.getStatusDescription())
        taskReport.setErrorDetail(task.getErrorDetails()[0])
        taskReport.setStartTime(task.getStartTime())
        taskReport.setEndTime(task.getEndTime())
        taskReport.setMetrics(task.getMetrics())
        taskReport.setResult(task.getExecutionResult() === ExecutionResult.success ? "Success" : task.getExecutionResult() === ExecutionResult.warning ? "Warning" : "Error")
        taskReport.style = task.getExecutionResult() === ExecutionResult.success ? taskReport.cardSuccessStyle : task.getExecutionResult() === ExecutionResult.warning ? taskReport.cardWarningStyle : taskReport.cardErrorStyle
        task.ResultActions.forEach((value, index, array) => { taskReport.actions.push(value.Name) })

        return taskReport
    }

    // Task Listeners
     beforeTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {
        this.processedItem = task.getSubject();

    }
    postTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {

        let taskReport = this.buildTaskReport(task)

        this.tasksReport.push(taskReport);
        this.executionCounter++;
    }

    beforeTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void { }

    postTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {

        let taskReport = this.buildTaskReport(task)
        this.tasksReport.push(taskReport);
        this.executionCounter++;

    }

    // Process Listeners
    beforeCheck(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {}
    postCheck(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {}
	beforeProcess(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {
        this.tasksReport = []
    }
    postProcess(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void {}

    // Async Process Listeners

    postAsyncProcess(execution: AsyncTaskExecutor): void {
        this.executionResult = execution.getResult()
        this.executionStatus = execution.getExecutionStatus()
    }

    beforeAsyncCheck(execution: AsyncTaskExecutor): void { }
    postAsyncCheck(execution: AsyncTaskExecutor): void {
        this.executionResult = execution.getResult()
        this.executionStatus = execution.getExecutionStatus()
    }
    beforeAsyncProcess(execution: AsyncTaskExecutor): void { 
        this.tasksReport = []
    }



}



//Only one error detail is supported right now
export class TaskReport {
    id: string
    subject: string;
    result: string;
    statusDescription: string;
    startTime: number;
    endTime: number;
    metrics: Array<Metric>;
    error: ErrorDetail;
    expanded: boolean = false
    actions: Array<string> = []
    style: {}
    cardSuccessStyle = { 'border-left': 'solid 3px #32db64' }
    cardErrorStyle = { 'border-left': 'solid 3px #f53d3d' }
    cardWarningStyle = { 'border-left': 'solid 3px orange' }

    get Id(): string {
        return this.id
    }

    set Id(value: string) {
        this.id = value
    }


    get Actions(): Array<string> {
        return this.actions
    }
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