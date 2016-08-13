import {Injectable} from '@angular/core';

@Injectable()
export class SCMSettings {
    constuctor() { }

    getSCMUrl() {
        return 'https://bitbucket.org'
    }

    getUsername() {
        return 'myusername'
    }

    getPassword() {
        return 'password'
    }

}