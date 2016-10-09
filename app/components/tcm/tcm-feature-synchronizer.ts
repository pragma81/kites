import {TCMService} from '../../services/tcm/TCMService';
import {ViewController, NavParams, Tabs, Tab, Events} from 'ionic-angular';
import {Component, ViewChild} from '@angular/core';
import {Feature} from '../../models/Feature';
import {FeatureTab} from './tcm-feature-tab';
import {ScenarioTab} from './tcm-scenario-tab';
import {JiraTCM} from '../../services/tcm/JiraTCM';
import {FeatureTCM} from '../../models/tcm/FeatureTCM'
import {SettingsServiceImpl} from '../../services/settings/SettingsServiceImpl'
import {AppConfig} from '../../models/AppConfig'
import {FileSystem} from '../../services/storage/FileSystem';



@Component({
  selector: 'tex-tcm-synchronizer',
  templateUrl: 'build/components/tcm/tcm-feature-sychronizer.html',
  providers: [JiraTCM, SettingsServiceImpl, AppConfig,FileSystem]
})
export class TCMFeatureSynchronizer {
  private feature: Feature
  private featureTab: any
  private scenarioTab: any
  private segment: string = "Feature"
  private scenarioinput = {}

  @ViewChild("tcmTabs") tcmTabs: Tabs;
  @ViewChild("featureTab") featureTabRef: Tab;
  constructor(public viewCtrl: ViewController, private navParams: NavParams, private events: Events) {
    this.featureTab = FeatureTab
    this.scenarioTab = ScenarioTab

    console.log("initialize TCMFeatureSynchronizer ")
    this.feature = this.navParams.get("feature")
    console.log("Passed params", navParams.data);

    this.events.subscribe('feature:linked', (data) => {
      // userEventData is an array of parameters, so grab our first and only arg
      console.log('Data:', data[0]);
      this.onFeatureLinked(data[0])
    })

     this.events.subscribe('tcmsync:close', (data) => {
     let featureUpdated = data[0]
     this.viewCtrl.dismiss().then(()=>{
       this.events.publish("feature:update",featureUpdated)})
    })
  }

  public onFeatureLinked(featureTcm) {

    //Save the new featureTCM in the feature repository and in the feature file
    //call featureServiceImpl.linkFeatureTCM(feature,featureTCM) 
    //1) update file with new service which use nodejs readline
    // 2)update database: featureService.parsegherkin(featurefile), featureservice.save(feature) 
    this.scenarioinput = { feature: this.feature, featureTCM: featureTcm }
    this.tcmTabs.select(1)
    
      this.events.publish('scenario:linked',featureTcm)

  }
}