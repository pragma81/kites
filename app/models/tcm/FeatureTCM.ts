import {Injectable} from '@angular/core';
import {TestCase} from './TestCase';

@Injectable()
export class FeatureTCM {
    private id: string
    private summary: string
    private description: string
    private status: string
    private creationTime: Date
    private updateTime: Date
    private author: string
    private release: string
    //private type: Type  = Type.UserStory
    private testCases: Array<TestCase> = []
    private customFields: Map<string, Object> 

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

     get Release(): string {
        return this.release
    }

    set Release(value: string) {
        this.release = value
    }

     get TestCases(): Array<TestCase> {
        return this.testCases
    }

    set TestCases(value: Array<TestCase>) {
        this.testCases = value
    }
   public addTestCase(testCase : TestCase):void {
        this.testCases.push(testCase)
    }

    public addCustomFied (key : string, value : Object){
        this.customFields.set(key,value)
    }

    public getCustomField(key :string ){
        return this.customFields.get(key)
    }

    public getCustomFields(): Map<string,Object>{
        return this.customFields
    }
    
}

enum Type {
    UserStory,
    Epic,
    Feature
}