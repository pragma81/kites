
import {Injectable} from '@angular/core';
import {FileSystem} from '../services/storage/FileSystem';

declare var nodeRequire: any
@Injectable()
export class AppConfig {
    private workspaceHomeFolder: string
    

    constructor(private fileSystem:FileSystem) {
        var config = nodeRequire('electron').remote.getGlobal('sharedObject').config
        this.workspaceHomeFolder = config.get('app.workspace.home')

        if (this.workspaceHomeFolder === undefined || this.workspaceHomeFolder === null) {
            let process = nodeRequire('electron').remote.process
            let userhome = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
            this.workspaceHomeFolder =userhome+ this.fileSystem.fileSeparator()+'kites'
        }
    }

    public get TestSuiteDefaultFolderName() {
        return 'testsuite'
    }

    public get AppFolderName() {
        return 'home'
    }

    public get TestSuiteProjectFileNameExtension() {
        return '.project'
    }

    public get WorkspaceHome() {
        return this.workspaceHomeFolder
    }

}