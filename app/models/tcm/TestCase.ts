import {Injectable} from '@angular/core';



@Injectable()
export class TestCase {
    private id: string
    private summary: string
    private description: string
    private status: string
    private creationTime: Date
    private updateTime: Date
    private author: string
    private customFields: Map<string, Object> 
   // private executions : Array<TestCaseExecution>

   constructor() {
        this.customFields = new Map<string,Object>()
    }

    get Id(): string {
        return this.id
    }

    set Id(value: string) {
        this.id = value
    }

    get Summary(): string {
        return this.summary
    }

    set Summary(value: string) {
        this.summary = value
    }

    get Description(): string {
        return this.description
    }

    set Description(value: string) {
        this.description = value
    }

    get Status(): string {
        return this.status
    }

    set Status(value: string) {
        this.status = value
    }

     get CreationTime(): Date {
        return this.creationTime
    }

    set CreationTime(value: Date) {
        this.creationTime = value
    }

     get UpdateTime(): Date {
        return this.updateTime
    }

    set UpdateTime(value: Date) {
        this.updateTime = value
    }

    get Author(): string {
        return this.author
    }

    set Author(value: string) {
        this.author = value
    }
}