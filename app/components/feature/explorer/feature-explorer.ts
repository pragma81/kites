import {Component, Output, EventEmitter} from '@angular/core';
import {ModalController, ToastController} from 'ionic-angular';
import {FeatureService} from '../../../services/feature/FeatureService';
import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {Tiles, Tile} from '../../tiles/tiles';
import {TestSuite} from '../../../models/TestSuite';
import {Feature, FeatureType} from '../../../models/Feature';
import {TestSuiteImporter} from '../../test-suite/import/test-suite-importer';
import {TestSuiteInfo} from '../../test-suite/explorer/test-suite-explorer';
import {FeatureSourceView} from '../source/feature-source-view';
import {FeatureImporter} from '../import/feature-importer';


@Component({
  selector: 'tex-feature-explorer',
  templateUrl: 'build/components/feature/explorer/feature-explorer.html',
  directives: [Tiles],
  providers: [FeatureServiceImpl]
})
export class FeatureExplorer {
  private selectedType: string = 'ui'
  private featureService: FeatureService;
  private featuresInfo: Array<FeatureInfo> = [];


  @Output() featureUpdate = new EventEmitter();
  constructor(private modalController: ModalController, featureService: FeatureServiceImpl, private toastController: ToastController) {
    this.featureService = featureService;
  }


  load(testSuite: TestSuite): void {
    //Reset features
    this.featuresInfo = []
    console.log("load features for test suite:" + testSuite.getName());

    this.featureService.getByTestSuite(testSuite.getName(),
      (features: Array<Feature>) => {
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

        })
      })
  }
  filter(testsuitename: string, testType: FeatureType, summaryexpr: string) {
    console.log('filtering');
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
        //TO-DO If upload failed I shoould not raise feature update
        if (isSuccess)
          this.featureUpdate.emit(featureInfo.feature);
      });
      modal.present()

    } else {
      let alert = this.toastController.create({
        message: 'Feature file already updated to [' + featureInfo.feature.getFileInfo().getUpdateTime().toLocaleString() + ']',
        duration: 3000,
        position: 'top',
      });
      alert.present();
    }

  }
}

export class FeatureInfo {
  feature: Feature;
  tiles: Array<Tile> = [];
  constructor() { }
}