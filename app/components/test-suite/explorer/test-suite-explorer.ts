import * as path from 'path';
import {Component} from '@angular/core';
import {NavController, Modal} from 'ionic-angular';
import {TestSuiteService} from '../../../services/testsuite/TestSuiteService';
import {TestSuiteServiceImpl} from '../../../services/testsuite/TestSuiteServiceImpl';
import {Tiles, Tile} from '../../tiles/tiles';
import {TestSuiteImporter} from '../import/test-suite-importer';
import {TestSuite} from '../../../models/TestSuite';


@Component({
  selector: 'tex-testsuite-explorer',
  templateUrl: 'build/components/test-suite/explorer/test-suite-explorer.html',
  directives: [Tiles],
  providers: [TestSuiteServiceImpl]
})
export class TestSuiteExplorer {
  private testSuiteService: TestSuiteService;
  private testsSuiteInfo: Array<TestSuiteInfo> = [];
  constructor(private nav: NavController, testSuiteService: TestSuiteServiceImpl) {
    console.log('explorer initialized')
    this.testSuiteService = testSuiteService;
  }



  goToTestSuiteImporter() {

    this.nav.push(TestSuiteImporter)
  }

  load() {
    this.testsSuiteInfo = []
    this.testSuiteService.getAll(
      (testsSuite: Array<TestSuite>) => {
        testsSuite.forEach(testSuite => {

          let testSuiteInfo = new TestSuiteInfo();
          testSuiteInfo.testSuite = testSuite;
          let featuresTile = new Tile(testSuite.getFeatures(), 'Features');
          let apiTile = new Tile(testSuite.getAPITests(), 'Api');
          let uiTile = new Tile(testSuite.getUiTests(), 'Ui');
          testSuiteInfo.tiles.push(featuresTile);
          testSuiteInfo.tiles.push(apiTile);
          testSuiteInfo.tiles.push(uiTile);
          this.testsSuiteInfo.push(testSuiteInfo);
        })
      })

  }


}

export class TestSuiteInfo {
  testSuite: TestSuite;
  tiles: Array<Tile> = [];
  constructor() { }
}