import {Injectable} from '@angular/core';

@Injectable()
export class TCMSettings {
    constuctor() { }

    getTCMUrl() {
        return 'https://jira.org'
    }

    getUsername() {
        return 'myusername'
    }

    getPassword() {
        return 'password'
    }

    getFeatureFileKeyword() {
        return 'featureid'
    }

}