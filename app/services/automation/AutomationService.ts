export interface AutomationService {
    generateAutomationFolderLayout(testsuitename:string, absoluteRootFolderPath :string):void
}



export enum ExecutionRuntime {
    JAVA
}