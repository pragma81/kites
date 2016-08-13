
import {Injectable} from '@angular/core';

@Injectable()
export class AppConfig {

    constuctor() { }
    
    public getTestSuiteDefaultFolderName() {
        return 'testsuite'
    }

    public getAppFolderName() {
        return 'home'
    }

    public getTestSuiteProjectFileNameExtension() {
        return '.project'
    }

}