import {Injectable} from '@angular/core';
import {AutomationService} from './AutomationService';
import {FileSystem} from '../storage/FileSystem';

declare var nodeRequire: any
declare var window:any

@Injectable()
export class JavaAutomationService implements AutomationService {
    constructor(private fileSystem:FileSystem){

    }

generateAutomationFolderLayout(testsuitename:string, absoluteRootFolderPath :string):void {
let sep = this.fileSystem.fileSeparator()
let process = nodeRequire('electron').remote.process
let fse = window.fse
let srcPath = process.resourcesPath+sep+'app/conf/java/dts-template'
fse.copy(srcPath, absoluteRootFolderPath)

}

}