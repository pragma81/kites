import {TestSuite} from '../../models/TestSuite';
import {Component, ViewChild} from '@angular/core';
import {NavController} from 'ionic-angular';
import {TestSuiteExplorer} from '../test-suite/explorer/test-suite-explorer';
import {Tiles} from '../tiles/tiles';
import {FeatureExplorer} from '../feature/explorer/feature-explorer';
import {Feature} from '../../models/Feature'

declare var Gherkin: any;

@Component({
  templateUrl: 'build/components/dashboard/DashboardPage.html',
  directives: [Tiles, TestSuiteExplorer, FeatureExplorer]

})
export class DashboardPage {
  @ViewChild(TestSuiteExplorer)
  private testSuiteExplorer: TestSuiteExplorer;
  @ViewChild(FeatureExplorer)
  private featureExplorer: FeatureExplorer;

  private currentTestSuite : TestSuite

  public fileText: string = "";
  
  constructor(private nav: NavController) {
  }

  ionViewDidEnter() {
    console.log('entered in dashboard')
    this.testSuiteExplorer.load();
  }

onTestSuiteClick(testSuite:TestSuite){
  console.log("test suite clicked in explorer.")
   this.currentTestSuite = testSuite
  this.featureExplorer.load(testSuite);
}
   
onFeatureUpdate(feature:Feature){
console.log("feature changed reload feature explorer")
  this.featureExplorer.load(this.currentTestSuite);
}   
}
