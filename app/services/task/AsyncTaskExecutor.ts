import {Injectable} from '@angular/core';
import {TaskInfo, ExecutionResult, ExecutionStatus} from './TaskInfo';
import {TaskResultAction} from './TaskAction';
import { Observable}     from 'rxjs/Observable';


//@Injectable()
export class AsyncTaskExecutor {
    private title: string;
    private executionCounter: number;
    private tasksRequest: Array<TaskInfo> = [];
	private tasksExecution: Array<TaskInfo> = [];
	private asyncTaskHandler: AsyncTaskHandler;
	private result: ExecutionResult;
	//if true only task check is performed
	private dryrun: boolean = false;
	private status: ExecutionStatus;

	private defaultSuccessDescription: string = 'Operation Completed Successfully'

	private defaultWarningDescription: string = 'Operation Completed with Warnings'
	//Bulk execution listeners
	private executionListener: Array<AsyncExecutionListener> = [];

	//Single task execution listeners
	private taskExecutionListener: Array<TaskExecutionListener> = [];

	//Single task result handlers
	private taskResultActionBuilders: Array<TaskResultActionBuilder> = []

	constructor(title: string, taskHandler: AsyncTaskHandler) {
		this.title = title;
		this.asyncTaskHandler = taskHandler;
		this.status = ExecutionStatus.compiling;
	}

	public getTitle(): string {
		return this.title;
	}

	public getDryrun(): boolean {
		return this.dryrun;
	}

	public setDryrun(value: boolean) {
		this.dryrun = value;
	}


	public getTasksRequest(): Array<TaskInfo> {
		return this.tasksRequest;
	}

	public setTasksRequest(value: Array<TaskInfo>) {
		this.tasksRequest = value;
	}


	public getTasksExecution(): Array<TaskInfo> {
		return this.tasksExecution;
	}

	public setTasksExecution(value: Array<TaskInfo>) {
		this.tasksExecution = value;
	}



	public addExecutionListener(value: AsyncExecutionListener) {
		this.executionListener.push(value);
	}

	public addTaskExecutionListener(value: TaskExecutionListener) {
		this.taskExecutionListener.push(value);
	}

	public addTaskExecutionRequest(id: string, name: string, inputHolder) {
		let task: TaskInfo = new TaskInfo(id, name, inputHolder);
		this.tasksRequest.push(task);
	}

	public getTasksCounter(): number {
		return this.tasksRequest.length;
	}

	public addTaskResultActionBuilder(taskResultActionBuilder: TaskResultActionBuilder) {
		this.taskResultActionBuilders.push(taskResultActionBuilder)
	}

	public start() {

		/*
		 If validated it means that it is a process request after a validation 
		 process successfully completed
		 */

		if (this.status === ExecutionStatus.validated) {
			this.status = ExecutionStatus.processing;
			this.process();
		}

		if (this.status === ExecutionStatus.compiling) {
			this.status = ExecutionStatus.validating;
			this.validate();

		}

	}

	private evaluateOverallAsyncStatus() {

		if (this.status === ExecutionStatus.compiling) {
			this.status = ExecutionStatus.validated;
		}

		if (this.status === ExecutionStatus.processing) {
			this.status = ExecutionStatus.processed;
		}

		if (this.dryrun) {
			return
		} else {
			if (this.result === ExecutionResult.success) {
				this.status = ExecutionStatus.processing;
				this.process();
			}

		}
	}

	public getResult(): ExecutionResult {
		return this.result;
	}

	public getExecutionStatus(): ExecutionStatus {
		return this.status
	}

	public isCompleted() {
		return this.status === ExecutionStatus.processed
	}

	public isValidated() {
		return this.status === ExecutionStatus.validated
	}

	public isSuccess() {
		return this.result === ExecutionResult.success
	}

	public isError() {
		return this.result === ExecutionResult.error
	}


	private validate(): void {

		/* Success by default. If one of the task is in error the overall 
		task execution is error
		*/
		let result = ExecutionResult.success;

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.beforeAsyncCheck(this);
			})

		}

		this.tasksRequest.forEach((taskInfo, index, tasks) => {

			//Execute task listener
			if (this.taskExecutionListener != undefined) {
				this.taskExecutionListener.forEach((listener) => {
					listener.beforeTaskCheck(taskInfo, index, tasks, this.executionCounter, this.title);
				})
			}
			//task info is updated with output and check status
			this.asyncTaskHandler.check(taskInfo).subscribe(
				taskinfo => {
					this.tasksExecution.push(taskInfo)

					if (taskInfo.getExecutionResult() === ExecutionResult.error) {
						this.result = ExecutionResult.error
					}

					if (taskInfo.getExecutionResult() === ExecutionResult.success) {
						// If only one task is in error the overall execution still be error
						if(this.result != ExecutionResult.error)
							this.result = ExecutionResult.success
						
						if (!taskInfo.getStatusDescription())
							taskInfo.setStatusDescription(this.defaultSuccessDescription)
					}

					if (taskInfo.getExecutionResult() === ExecutionResult.warning) {
						this.result = ExecutionResult.warning
						if (!taskInfo.getStatusDescription())
							taskInfo.setStatusDescription(this.defaultWarningDescription)
					}



					//Execute task listener
					if (this.taskExecutionListener != undefined) {
						this.taskExecutionListener.forEach((listener) => {
							listener.postTaskCheck(taskInfo, index, tasks, this.executionCounter, this.title);
						})
					}

					this.executionCounter++;

					console.log(`requests [${this.tasksRequest.length}] results [${this.tasksExecution.length}]`)
					if (this.tasksRequest.length === this.tasksExecution.length) {
						this.status = ExecutionStatus.validated
						//Execute report listener
						if (this.executionListener != undefined) {
							this.executionListener.forEach((listener) => {
								listener.postAsyncCheck(this);
							})

						}

						if (!this.dryrun && this.status === ExecutionStatus.validated && this.result != ExecutionResult.success)
							this.process();

					}

				},
				error => {
					/* I should build an error with details and then evaluate overall async status. 
					*	Currently I don't know how to correlate an error the source taskinfo in an asynchronous way. 
					*   But I simply don't need it, only unrecoverable, unknow runtime excpetion must be managed here
					*/
				});

		})

	}

	private process(): void {
		
		/* If check result is error than no process steps are called
		*/

		if(this.result != ExecutionResult.success)
		return
		/* Success by default. If one of the task is in error the overall 
		task execution is error
		*/
		let result = ExecutionResult.success;

		/*
		* reset task execution
		*/
		this.tasksExecution = []

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.beforeAsyncProcess(this);
			})

		}

		this.tasksRequest.forEach((taskInfo, index, tasks) => {

			//Execute task listener
			if (this.taskExecutionListener != undefined) {
				this.taskExecutionListener.forEach((listener) => {
					listener.beforeTaskProcess(taskInfo, index, tasks, this.executionCounter, this.title);
				})
			}

			//task info is updated with output and check status
			this.asyncTaskHandler.process(taskInfo).subscribe(
				taskInfo => {
					this.tasksExecution.push(taskInfo)


					if (taskInfo.getExecutionResult() === ExecutionResult.error) {
						this.result = ExecutionResult.error
					}

					if (taskInfo.getExecutionResult() === ExecutionResult.success) {
						// If only one task is in error the overall execution still be error
						if(this.result != ExecutionResult.error)
							this.result = ExecutionResult.success

						if (!taskInfo.getStatusDescription())
							taskInfo.setStatusDescription(this.defaultSuccessDescription)
					}

					if (taskInfo.getExecutionResult() === ExecutionResult.warning) {
						this.result = ExecutionResult.warning
						if (!taskInfo.getStatusDescription())
							taskInfo.setStatusDescription(this.defaultWarningDescription)
					}


					//Execute task listener
					if (this.taskExecutionListener != undefined) {
						this.taskExecutionListener.forEach((listener) => {
							listener.postTaskProcess(taskInfo, index, tasks, this.executionCounter, this.title);
						})
					}

					this.executionCounter++;

					console.log(`requests [${this.tasksRequest.length}] results [${this.tasksExecution.length}]`)
					if (this.tasksRequest.length === this.tasksExecution.length) {
						this.status = ExecutionStatus.processed
						//Execute report listener
						if (this.executionListener != undefined) {
							this.executionListener.forEach((listener) => {
								listener.postAsyncProcess(this);
							})

						}
					}

				},
				error => {
					/* I should build an error with details and then evaluate overall async status. 
					*	Currently I don't know how to correlate an error the the source taskinfo in an asynchronous way. 
					*   But I simply don't need it, only unrecoverable, unknow runtime excpetion must be managed here
					*/
				});

		})
		return
	}


	private buildTaskResultActions(taskinfo: TaskInfo) {
		this.taskResultActionBuilders.forEach(builder => {
			taskinfo.addResultAction(builder.build(taskinfo))
		})
	}

	public executeTaskResultAction(taskId: string, actionName?: string, runDefault?: boolean) {
		let task = this.tasksExecution.find(task => {
			return task.Id === taskId
		})
		if (!task) {
			throw new Error(`No task with id [${taskId}] found `)
		}
		let action = task.ResultActions.find((value, index, array) => {

			if (runDefault) {
				return value.isDefault()
			} else {
				return value.Name === actionName
			}

		})
		if (!action && runDefault)
			throw new Error(`No Default action found for task [${task.getSubject()}]`)

		if (!action && !runDefault)
			throw new Error(`No action [${actionName}] found for task [${task.getSubject()}]`)


		action.execute(task)
	}


}



export interface TaskHandler {
    check(taskInfo: TaskInfo): TaskInfo
    process(taskInfo: TaskInfo): TaskInfo
}

export interface AsyncTaskHandler {
    check(taskInfo: TaskInfo): Observable<TaskInfo>
    process(taskInfo: TaskInfo): Observable<TaskInfo>
}

export interface TaskResultActionBuilder {
	build(taskinfo: TaskInfo): TaskResultAction
}
export interface AsyncExecutionListener {
    beforeAsyncCheck(execution: AsyncTaskExecutor): void
    postAsyncCheck(execution: AsyncTaskExecutor): void
	beforeAsyncProcess(execution: AsyncTaskExecutor): void
    postAsyncProcess(execution: AsyncTaskExecutor): void
}

export interface TaskExecutionListener {
    beforeTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void

	beforeTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
}





