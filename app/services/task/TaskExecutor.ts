import {Injectable} from '@angular/core';
import {TaskInfo, ExecutionResult, ExecutionStatus} from './TaskInfo';
import {TaskResultAction} from './TaskAction';
import { Observable}     from 'rxjs/Observable';


export class BulkExecutionResult {
	status: ExecutionStatus
	result: ExecutionResult

	public get Status(): ExecutionStatus {
		return this.status;
	}

	public set Status(value: ExecutionStatus) {
		this.status = value;
	}

	public get Result(): ExecutionResult {
		return this.result;
	}

	public set Result(value: ExecutionResult) {
		this.result = value;
	}
}

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


	private defaultSuccessDescription: string = 'Operation Completed Successfully'

	private defaultWarningDescription: string = 'Operation Completed with Warnings'
	//Bulk execution listeners
	private executionListener: Array<ExecutionListener> = [];

	//Single task execution listeners
	private taskExecutionListener: Array<TaskExecutionListener> = [];

	//Single task result handlers
	private taskResultActionBuilders: Array<TaskResultActionBuilder> = []

	constructor(title: string, taskHandler: TaskHandler) {
		this.title = title;
		this.taskHandler = taskHandler;
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


	public addExecutionListener(value: ExecutionListener) {
		this.executionListener.push(value);
	}

	public addTaskExecutionListener(value: TaskExecutionListener) {
		this.taskExecutionListener.push(value);
	}

	public addTaskExecutionRequest(id: string, name: string, inputHolder) {
		let task: TaskInfo = new TaskInfo(id, name, inputHolder);
		this.tasks.push(task);
	}

	public getTasksCounter(): number {
		return this.tasks.length;
	}

	public addTaskResultActionBuilder(taskResultActionBuilder: TaskResultActionBuilder) {
		this.taskResultActionBuilders.push(taskResultActionBuilder)
	}

	public start(): BulkExecutionResult {

		/*
		 If validated it means that it is a process request after a validation 
		 process successfully completed
		 */

		if (this.status === ExecutionStatus.validated) {
			this.status = ExecutionStatus.processing;
			this.result = this.process();
			this.status = ExecutionStatus.processed;
		} else {
			if (this.status === ExecutionStatus.compiling) {
				this.status = ExecutionStatus.validating;
				this.result = this.validate();
				this.status = ExecutionStatus.validated;
				
				if (!this.dryrun) {
					if (this.result === ExecutionResult.success) {
						this.status = ExecutionStatus.processing;
						this.result = this.process();
						this.status = ExecutionStatus.processed;
					}
				}
			} else {
				throw new Error("Execution state error[" + this.status + "]")
			}
		}

		let bulkExecutionResult = new BulkExecutionResult()
		bulkExecutionResult.Result = this.result
		bulkExecutionResult.Status = this.status

		return bulkExecutionResult



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


	private validate(): ExecutionResult {

		/* Success by default. If one of the task is in error the overall 
		task execution is error
		*/
		let result = ExecutionResult.success;

		//Execute report listener
		if (this.executionListener != undefined) {
			this.executionListener.forEach((listener) => {
				listener.beforeCheck(this,this.tasks, this.executionCounter, this.title);
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

			//Build result action if available
			this.buildTaskResultActions(taskInfo)

			if (taskInfo.getExecutionResult() === ExecutionResult.error) {
				result = ExecutionResult.error
			}

			if (taskInfo.getExecutionResult() === ExecutionResult.success) {
				if (!taskInfo.getStatusDescription())
					taskInfo.setStatusDescription(this.defaultSuccessDescription)
			}

			if (taskInfo.getExecutionResult() === ExecutionResult.warning) {
				if (!taskInfo.getStatusDescription())
					taskInfo.setStatusDescription(this.defaultWarningDescription)
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
				listener.postCheck(this,this.tasks, this.executionCounter, this.title);
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
				listener.beforeProcess(this,this.tasks, this.executionCounter, this.title);
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

			//Build result action if available
			this.buildTaskResultActions(taskInfo)

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
				listener.postProcess(this,this.tasks, this.executionCounter, this.title);
			})

		}
		return result
	}


	private buildTaskResultActions(taskinfo: TaskInfo) {
		this.taskResultActionBuilders.forEach(builder => {
			taskinfo.addResultAction(builder.build(taskinfo))
		})
	}

	public executeTaskResultAction(taskId: string, actionName?: string, runDefault?: boolean) {
		let task = this.tasks.find(task => {
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

export interface TaskResultActionBuilder {
	build(taskinfo: TaskInfo): TaskResultAction
}
export interface ExecutionListener {
    beforeCheck(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postCheck(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
	beforeProcess(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postProcess(taskExecutor:TaskExecutor,tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
}

export interface TaskExecutionListener {
    beforeTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postTaskCheck(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void

	beforeTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
    postTaskProcess(task: TaskInfo, index: number, tasks: Array<TaskInfo>, executionCounter: number, reportTitle: string): void
}





