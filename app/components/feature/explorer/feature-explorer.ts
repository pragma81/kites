import {TCMFeatureSynchronizer} from '../../tcm/tcm-feature-synchronizer';
import {Component, Output, EventEmitter} from '@angular/core';
import {ModalController, ToastController, NavController, PopoverController, ViewController,AlertController,Events} from 'ionic-angular';
import {FeatureService} from '../../../services/feature/FeatureService';
import {SettingsService} from '../../../services/settings/SettingsService';
import {SettingsServiceImpl} from '../../../services/settings/SettingsServiceImpl';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {Tiles, Tile} from '../../tiles/tiles';
import {CardPlaceholder} from '../../card/card-placeholder';
import {TestSuite} from '../../../models/TestSuite';
import {TCMSettings} from '../../../models/TCMSettings';
import {Feature, FeatureType} from '../../../models/Feature';
import {TestSuiteImporter} from '../../test-suite/import/test-suite-importer';
import {TestSuiteInfo} from '../../test-suite/explorer/test-suite-explorer';
import {FeatureSourceView} from '../source/feature-source-view';
import {FeatureImporter} from '../import/feature-importer';
import {FeatureEditor} from '../editor/feature-editor'
import {FeatureCreate} from '../create/feature-create'
import {FeatureCreateWizard} from '../create/feature-create-wizard'
import {TCMView} from '../../tcm/tcm-view';
import {MsToDate} from '../../../pipes/MsToDate'


@Component({
  selector: 'tex-feature-explorer',
  templateUrl: 'build/components/feature/explorer/feature-explorer.html',
  directives: [Tiles,CardPlaceholder],
  pipes: [MsToDate]
})
export class FeatureExplorer {
  private selectedType: string = 'ui'
  private featureService: FeatureService;
  private featuresInfo: Array<FeatureInfo> = [];
  private unfilteredFeaturesInfo: Array<FeatureInfo> = [];
  private testSuite: TestSuite;
  private scenarioFullText: boolean
  private tcmBaseUrl: string
  private settingsService: SettingsService
  private tcmSettings: TCMSettings
  private testsuitename: string
  private loading: boolean = false


  @Output() featureUpdate = new EventEmitter();
  constructor(private nav: NavController,
    private modalController: ModalController,
    featureService: FeatureServiceImpl,
    private toastController: ToastController,
    public popoverCtrl: PopoverController,
    settingsService: SettingsServiceImpl,
    private alertController: AlertController,
    private events:Events) {
    this.featureService = featureService;
    this.settingsService = settingsService
    this.tcmSettings = settingsService.getTestCaseManegementSettings()
    this.tcmBaseUrl = this.tcmSettings.Protocol + '://' + this.tcmSettings.Url + '/browse/'
  }

  clear() {
    this.testSuite = undefined
    this.featuresInfo.length = 0
     this.unfilteredFeaturesInfo.length = 0
  }

  loadByTestSuiteName(testSuiteName: string): void {
   this.loading = true
    this.testsuitename = testSuiteName
    
    this.featureService.getByTestSuite(testSuiteName,
      (features: Array<Feature>) => {
         this.featuresInfo.length = 0
        this.unfilteredFeaturesInfo.length = 0

        features.forEach(feature => {
          console.log("Feature [" + feature.getId() + "] found")
          let featureInfo = new FeatureInfo()
          featureInfo.feature = feature
          let scenarios = new Tile(feature.getScenariosTotal(), 'Scenarios')
          let auto = new Tile(feature.getAutoScenariosTotal(), 'Auto')
          let smoke = new Tile(feature.getSmokeScenarios().length, 'Smoke')
          let basic = new Tile(feature.getBasicScenarios().length, 'Basic')
          let acceptance = new Tile(feature.getAcceptanceScenarios().length, 'Acceptance')
          featureInfo.tiles.push(scenarios)
          featureInfo.tiles.push(auto)
          featureInfo.tiles.push(smoke)
          featureInfo.tiles.push(basic)
          featureInfo.tiles.push(acceptance)
          this.featuresInfo.push(featureInfo)
          this.unfilteredFeaturesInfo.push(featureInfo)
          this.loading = false
        })
      })
  }

  load(testSuite: TestSuite): void {
    //Reset features
    this.testSuite = testSuite

    this.loadByTestSuiteName(testSuite.getName())

  }

  filter(event: any) {
    //reset search
    this.featuresInfo = this.unfilteredFeaturesInfo.slice()
    let val = event.target.value;

    if (val === undefined || val.trim() === '') {
      // if the value is an empty string don't filter the items
      return
    }


    if (this.scenarioFullText)
      this.scenarioFiltering(val)
    else
      this.featureFiltering(val)
  }

  featureFiltering(criteria: string) {
    this.featuresInfo = this.featuresInfo.filter((featureInto) => {
      let summaryFilter: boolean = (featureInto.feature.getName().toLowerCase().indexOf(criteria.toLowerCase()) > -1)
      let descriptionFilter = true
      let description = featureInto.feature.getDescription()
      if (description && description.trim() != '')
        descriptionFilter = description.toLowerCase().indexOf(criteria.toLowerCase()) > -1
      else descriptionFilter = false
      return (summaryFilter || descriptionFilter);
    })
  }

  scenarioFiltering(criteria: string) {
    this.featuresInfo = this.featuresInfo.filter((featureInto) => {
      let feature = featureInto.feature

      //At least one scenario is contained
      return feature.searchScenariosBySummary(criteria).length > 0

    })
  }




  showSource(featureInfo: FeatureInfo) {
    console.log('show source for ' + featureInfo.feature.getName())

    const modal = this.modalController.create(FeatureSourceView, { "feature": featureInfo.feature });
    modal.present()

  }

  upload(featureInfo: FeatureInfo) {

    if (this.featureService.isOld(featureInfo.feature)) {
      const modal = this.modalController.create(FeatureImporter, { "feature": featureInfo.feature, callback: () => { } });
      modal.onDidDismiss(isSuccess => {
        if (isSuccess)
          this.featureUpdate.emit(featureInfo.feature);
      });
      modal.present()

    } else {

      //Native message box nodeRequire('electron').remote.dialog.showMessageBox({type :'warning',buttons:[],message :'ciao'})
      let alert = this.toastController.create({
        message: 'Feature file already updated to [' + featureInfo.feature.getFileInfo().getUpdateTime().toLocaleString() + ']',
        duration: 3000,
        position: 'top',
      });
      alert.present();
    }

  }

  edit(featureInfo: FeatureInfo) {
    let filexists : boolean = this.featureService.fileExists(featureInfo.feature.getFileInfo().getFileAbsolutePath())
    if(!filexists){
        let alert = this.alertController.create({
      title: "Cannot edit feature file",

      message: "Feature file was deleted or moved from its original path.It will removed from '"+featureInfo.feature.getTestSuiteName()+"' test suite in order to avoid further incosistencies. It is recommeded to delete and re-import the test suite",
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            this.featureService.delete(featureInfo.feature,()=>{
                this.events.publish('feature:update', { testsuitename: featureInfo.feature.getTestSuiteName(), feature: featureInfo.feature });
            })
        

          }
        }]
    });
    alert.present()
    } else {
    this.nav.push(FeatureCreate, { feature: featureInfo.feature })
    }
  }



  showAddFeatureMenu(event) {
    let popover = this.popoverCtrl.create(AddFeatureMenu,
      { testSuite: this.testSuite },
      { cssClass: 'feature-popover' });

    popover.present({
      ev: event,

    });
  }

  showFeatureMenu(featureInfo: FeatureInfo) {
    let popover = this.popoverCtrl.create(FeatureMenu,
      { feature: featureInfo.feature },
      { cssClass: 'feature-popover' });

    popover.present({
      ev: event,

    });
  }

  onTcmClick(feature: Feature): void {
    let tcmFeatureUrl = this.tcmBaseUrl + feature.getTCMId()
    this.nav.push(TCMView,{ url: tcmFeatureUrl })
  }

}



export class FeatureInfo {
  feature: Feature;
  tiles: Array<Tile> = [];
  constructor() { }
}

@Component({
  template: `
        <button  block clear (click)="openCreateFeature()"><ion-icon name="ios-folder-outline" large ></ion-icon> Create</button>
       <button block clear (click)="openImportFeature()"><ion-icon  name="ios-folder-open-outline" large ></ion-icon> Import</button>
      `
})
export class AddFeatureMenu {

  constructor(private nav: NavController, private viewCtrl: ViewController, private modalController: ModalController) { }
  openCreateFeature() {
    let testSuite = this.viewCtrl.data.testSuite
    //this.nav.push(FeatureCreate, {testSuite : testSuite})
    const modal = this.modalController.create(FeatureCreateWizard, { "testSuite": testSuite });

    this.viewCtrl.dismiss().then(() => {
      modal.present()
    })

  }

  openImportFeature() {
    console.log('import feature')
  }


}


@Component({
  template: `
        <button  block clear (click)="tcmSync()"><ion-icon name='md-link'></ion-icon>
          Sync
        </button>
       <button block clear (click)="run()"><ion-icon name='ios-play'></ion-icon>
          Run
        </button>
        <button block clear (click)="delete()"><ion-icon name='md-trash'></ion-icon>
          Trash
        </button>
      `
})
export class FeatureMenu {
  private feature: Feature
  private featureService: FeatureService
  constructor(private nav: NavController, private viewCtrl: ViewController, 
  private modalController: ModalController,
  private alertController:AlertController,featureService:FeatureServiceImpl,
  private events: Events) {
    this.feature = this.viewCtrl.data.feature
    this.featureService = featureService
  }

  tcmSync() {
    const modal = this.modalController.create(TCMFeatureSynchronizer, { "feature": this.feature, callback: () => { } },{enableBackdropDismiss:false});
    modal.onDidDismiss(isSuccess => { });
    this.viewCtrl.dismiss().then(() => {
      modal.present()
    })

  }

  delete() {

       let alert = this.alertController.create({
      title: "Confirmation Requested",

      message: "Are you sure you want to delete '"+this.feature.getName()+"' ? ",
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.featureService.delete(this.feature,()=>{
                this.events.publish('feature:update', { testsuitename: this.feature.getTestSuiteName(), feature: this.feature });
            })
        

          }
        }]
    });

    this.viewCtrl.dismiss().then(() => {
      alert.present()
    })
  }

  run() {
    this.viewCtrl.dismiss()
    console.log("Run Not yet implemented")
  }

}