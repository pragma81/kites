import {FormGroup,FormBuilder,Validators,FormControl} from '@angular/forms';
import {Component,Injector,Output,EventEmitter} from '@angular/core';
import {ToastController,Events} from 'ionic-angular';

import {TCMService} from '../../services/tcm/TCMService';
import {JiraTCM} from '../../services/tcm/JiraTCM';
import {Feature} from '../../models/Feature';
import {FeatureTCM} from '../../models/tcm/FeatureTCM';
import {NavParams} from 'ionic-angular';
import {TCMSettings} from '../../models/TCMSettings';
import {SettingsService} from '../../services/settings/SettingsService';
import {SettingsServiceImpl} from '../../services/settings/SettingsServiceImpl';

@Component({
  templateUrl: 'build/components/tcm/tcm-feature-tab.html',
  providers: [JiraTCM]
})
export class FeatureTab {
  private tcmService: TCMService
  private featureTCM: FeatureTCM
  private feature : Feature
  private tcmSettings: TCMSettings
  private settingsService: SettingsService
  private tcmId: string
  private isSearching: boolean = false
  private errorMessage = 'please enter a valid value'
  private showDetail = false

  private tcmSearchForm: FormGroup;
   @Output() featureLinked = new EventEmitter();

  constructor(private navParams: NavParams, injector: Injector, 
              settingsService: SettingsServiceImpl,
               private formBuilder:FormBuilder,
               private toastController : ToastController, private events: Events) {
    this.settingsService = settingsService
    this.tcmService = injector.get(JiraTCM)
    this.tcmSettings = this.settingsService.getTestCaseManegementSettings()
    this.feature = <Feature>this.navParams.data
    this.tcmId = this.feature.getTCMId()
    
    this.tcmSearchForm = formBuilder.group({
        tcmId: ['',Validators.compose([Validators.maxLength(30), Validators.pattern('([A-Z]{3,}-[1-9]+[0-9]*)'), Validators.required])]
    });

    (<FormControl>this.tcmSearchForm.controls['tcmId']).updateValue (this.tcmId)

    if (this.tcmId)
      this.tcmService.findFeature(this.tcmId)
      .subscribe(
      featureTCM => { this.featureTCM = featureTCM }, 
      error => {this.isSearching = false }
      
      )
  }

  public search() {
    this.featureTCM = undefined
    if(!this.tcmSearchForm.valid)
     return
   
    this.isSearching = true
    this.tcmService.findFeature(this.tcmSearchForm.controls['tcmId'].value)
      .subscribe(featureTCM => {
        this.featureTCM = featureTCM
        this.isSearching = false
      },
      error => {
        this.isSearching = false 
       this.showToast(this.tcmSearchForm.controls['tcmId'].value + ' not found in '+this.tcmSettings.TcmName)}
      )
  }

  
  showToast(message){
    let toast = this.toastController.create({
      duration: 3000
    });
    toast.setMessage(message)
    toast.present();
  }

  expandDetail(){
    this.showDetail = !this.showDetail
  }

  public linkFeature(){
    this.events.publish('feature:linked', this.featureTCM);
   // this.events.publish('feature:linked')
    //this.featureLinked.emit(featureTCM);
  }

 
}