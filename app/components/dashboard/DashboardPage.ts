import {TestSuite} from '../../models/TestSuite';
import {Component, ViewChild, Injectable} from '@angular/core';
import {NavController, Events,NavParams} from 'ionic-angular';
import {TestSuiteExplorer} from '../test-suite/explorer/test-suite-explorer';
import {Tiles} from '../tiles/tiles';
import {FeatureExplorer} from '../feature/explorer/feature-explorer';
import {Feature} from '../../models/Feature'
import {AppStateHolder} from '../../services/AppStateHolder';


@Component({
  templateUrl: 'build/components/dashboard/DashboardPage.html',
  directives: [Tiles, TestSuiteExplorer, FeatureExplorer],
  providers: [AppStateHolder]

})
export class DashboardPage {
  @ViewChild(TestSuiteExplorer)
  private testSuiteExplorer: TestSuiteExplorer;
  @ViewChild(FeatureExplorer)
  private featureExplorer: FeatureExplorer;

  private currentTestSuite: TestSuite
  private currentTestSuiteName : string

  constructor(private nav: NavController, private navParams: NavParams, private events: Events) {

    this.events.subscribe('feature:update', (data) => {
      let feature  = <Feature> data[0]
      console.log('[Feature Update] event arrived:', feature);
      this.featureExplorer.loadByTestSuiteName(feature.getTestSuiteName());
    })

    let currentFeature = <Feature> navParams.get("feature")
    if(currentFeature )
    this.currentTestSuiteName =currentFeature.getTestSuiteName()
  }


  ionViewDidEnter() {
    console.log('entered in dashboard')
    this.testSuiteExplorer.load();
    if(this.currentTestSuiteName)
     this.featureExplorer.loadByTestSuiteName(this.currentTestSuiteName);
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


}