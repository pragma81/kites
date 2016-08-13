import {Injectable} from '@angular/core'
import {SCMSettings} from '../../models/SCMSettings'
import {AppConfig} from '../../models/AppConfig'
import {TCMSettings} from '../../models/TCMSettings'
import {SettingsService} from './SettingsService'





@Injectable()
export class SettingsServiceImpl implements SettingsService {

constructor(){
}
    
    public getAppSettings() : AppConfig{
        return new AppConfig();
    }
    public getSourceControlManagementSettings() : SCMSettings {
        return new SCMSettings();
    }
   
   public getTestCaseManegementSettings() : TCMSettings {
       return new TCMSettings();
   }

}