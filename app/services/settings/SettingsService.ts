import {SCMSettings} from '../../models/SCMSettings'
import {AppConfig} from '../../models/AppConfig'
import {TCMSettings} from '../../models/TCMSettings'


export interface SettingsService {

    getAppSettings() : AppConfig;
    getSourceControlManagementSettings() : SCMSettings;
   
   getTestCaseManegementSettings() : TCMSettings;

}