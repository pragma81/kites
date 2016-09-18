import {TestSuite} from '../../models/TestSuite';
import {Component, ViewChild, Injectable} from '@angular/core';
import {NavController, Events, NavParams, ModalController} from 'ionic-angular';
import {TestSuiteExplorer} from '../test-suite/explorer/test-suite-explorer';
import {Tiles} from '../tiles/tiles';
import {FeatureExplorer} from '../feature/explorer/feature-explorer';
import {TestSuiteCreate} from '../test-suite/create/test-suite-create';
import {TestSuiteImporter} from '../test-suite/import/test-suite-importer';
import {Feature} from '../../models/Feature'
import {AppStateHolder} from '../../services/AppStateHolder';
import {TestSuiteService} from '../../services/testsuite/TestSuiteService';
import {TestSuiteServiceImpl} from '../../services/testsuite/TestSuiteServiceImpl';


@Component({
  templateUrl: 'build/components/dashboard/DashboardPage.html',
  directives: [Tiles, TestSuiteExplorer, FeatureExplorer],
  providers: [AppStateHolder, TestSuiteServiceImpl]

})
export class DashboardPage {
  @ViewChild(TestSuiteExplorer)
  private testSuiteExplorer: TestSuiteExplorer;
  @ViewChild(FeatureExplorer)
  private featureExplorer: FeatureExplorer;
  private showIntro: boolean = false
  private testSuiteService: TestSuiteService

  private currentTestSuite: TestSuite
  private currentTestSuiteName: string

  constructor(private nav: NavController, private navParams: NavParams,
    private events: Events, testSuiteService: TestSuiteServiceImpl,
    private modalController: ModalController) {

    this.testSuiteService = testSuiteService
    this.testSuiteService.getAll((testsuites: Array<TestSuite>) => {
      this.showIntro = testsuites.length === 0
    })

    this.events.subscribe('feature:update', (data) => {
      let feature = <Feature>data[0]
      console.log('[Feature Update] event arrived:', feature);
      this.featureExplorer.loadByTestSuiteName(feature.getTestSuiteName());
    })

     this.events.subscribe('testsuite:create',()=>{
      this.refreshDashboard()
    })

    let currentFeature = <Feature>navParams.get("feature")
    if (currentFeature)
      this.currentTestSuiteName = currentFeature.getTestSuiteName()
  }


  ionViewDidEnter() {
   this.refreshDashboard() 
   }

refreshDashboard(){
 this.testSuiteService.getAll((testsuites: Array<TestSuite>) => {
      this.showIntro = testsuites.length === 0
      if (!this.showIntro) {
        setTimeout(()=>{ 
          this.testSuiteExplorer.load();
          if (this.currentTestSuiteName)
          this.featureExplorer.loadByTestSuiteName(this.currentTestSuiteName);
          }, 300)
       
       
        
          
      }
    })
}

  onTestSuiteClick(testSuite: TestSuite) {
    console.log("test suite clicked in explorer.")
    this.currentTestSuite = testSuite
    this.featureExplorer.load(testSuite);
  }

  onFeatureUpdate(feature: Feature) {
    console.log("feature changed reload feature explorer")
    this.featureExplorer.load(this.currentTestSuite);
  }

  onTestSuiteDeleted() {
  this.featureExplorer.clear()
   this.refreshDashboard()
  }

  createTestSuite() {
    const modal = this.modalController.create(TestSuiteCreate);
    modal.present()

  }

  importTestSuite() {
    const modal = this.modalController.create(TestSuiteImporter);
    modal.present()
  }
}