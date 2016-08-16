import {Injectable} from '@angular/core';
import {TaskInfo, ExecutionStatus, ExecutionResult} from './TaskInfo';


//@Injectable()
export class TaskExecutor {
    private title: string;
    private executionCounter: number;
    private tasks: Array<TaskInfo> = [];
	private taskHandler: TaskHandler;
	private result: ExecutionResult;
	//if true only task check is performed
	private dryrun: boolean = false;
	private status: ExecutionStatus;
	private executionListener: Array<ExecutionListener> = [];
	private taskExecutionListener: Array<TaskExecutionListener> =[];

	constructor(title: string, taskHandler: TaskHandler) {
		this.title = title;
		this.taskHandler = taskHandler;
		this.status = ExecutionStatus.compiling;
	}


	public getDryrun(): boolean {
		return this.dryrun;
	}

	public setDryrun(value: boolean) {
		this.dryrun = value;
	}


	public addExecutionListener(value: ExecutionListener) {
		this.executionListener.push(value);
	}

	public addTaskExecutionListener(value: TaskExecutionListener) {
		this.taskExecutionListener.push(value);
	}

	public addTaskExecutionRequest(name: string, inputHolder) {
		let task: TaskInfo = new TaskInfo(name, inputHolder);
		this.tasks.push(task);
	}

	public getTasksCounter(): number {
		return this.tasks.length;
	}

	public start() {

		/*
		 If validated it means that it is a process request after a validation 
		 process successfully completed
		 */

		if (this.status === ExecutionStatus.validated) {
			this.status = ExecutionStatus.processing;
			this.result = this.process();
			this.status = ExecutionStatus.processed;
			return
		}

		if (this.status === ExecutionStatus.compiling) {
			this.status = ExecutionStatus.validating;
			this.result = this.validate();
			this.status = ExecutionStatus.validated;

			if (this.dryrun) {
				return
			} else {
				if (this.result === ExecutionResult.success) {
					this.status = ExecutionStatus.processing;
					this.result = this.process();
					this.status = ExecutionStatus.processed;
				}
			}
		}



	}


	public getResult(): ExecutionResult {
		return this.result;
	}
	
	public getExecutionStatus(): ExecutionStatus{
		return this.status
	}

	public isCompleted(){
		return this.status === ExecutionStatus.processed
	}

	public isValidated(){
		return this.status === ExecutionStatus.validated
	}

	public isSuccess(){
		return this.result === ExecutionResult.success
	}

	public isError(){
		return this.result === ExecutionResult.error
	}


	private validate(): ExecutionResult {

		/* Success by default. If one of the task is in error the overall 
		task execution is error
		*/
		let result = ExecutionResult.success;

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.beforeCheck(this.tasks, this.executionCounter, this.title);
			})

		}

		this.tasks.forEach((taskInfo, index, tasks) => {

			//Execute task listener
			if (this.taskExecutionListener != undefined) {
				this.taskExecutionListener.forEach((listener) => {
					listener.beforeTaskCheck(taskInfo, index, tasks, this.executionCounter, this.title);
				})
			}
			//task info is updated with output and check status
			taskInfo = this.taskHandler.check(taskInfo);
			if (taskInfo.getExecutionResult() === ExecutionResult.error) {
				result = ExecutionResult.error
			}
			this.executionCounter++;

			//Execute task listener
			if (this.taskExecutionListener != undefined) {
				this.taskExecutionListener.forEach((listener) => {
					listener.postTaskCheck(taskInfo, index, tasks, this.executionCounter, this.title);
				})
			}
		})

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.postCheck(this.tasks, this.executionCounter, this.title);
			})

		}
		return result
	}

	private process(): ExecutionResult {
		/* Success by default. If one of the task is in error the overall 
		task execution is error
		*/
		let result = ExecutionResult.success;

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.beforeProcess(this.tasks, this.executionCounter, this.title);
			})

		}

		this.tasks.forEach((taskInfo, index, tasks) => {

			//Execute task listener
			if (this.taskExecutionListener != undefined) {
				this.taskExecutionListener.forEach((listener) => {
					listener.beforeTaskProcess(taskInfo, index, tasks, this.executionCounter, this.title);
				})
			}
			//task info is updated with output and check status
			taskInfo = this.taskHandler.process(taskInfo);

			if (taskInfo.getExecutionResult() === ExecutionResult.error) {
				result = ExecutionResult.error
			}
			//Execute task listener
			if (this.taskExecutionListener != undefined) {
				this.taskExecutionListener.forEach((listener) => {
					listener.postTaskProcess(taskInfo, index, tasks, this.executionCounter, this.title);
				})
			}
		})

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.postProcess(this.tasks, this.executionCounter, this.title);
			})

		}
		return result
	}

	public getTitle(): string {
		return this.title;
	}


}


export interface TaskHandler {
    check(taskInfo: TaskInfo): TaskInfo
    process(taskInfo: TaskInfo): TaskInfo
}

export interface ExecutionListener {
    beforeCheck(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postCheck(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
	beforeProcess(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postProcess(tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
}

export interface TaskExecutionListener {
    beforeTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void

	beforeTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
}





