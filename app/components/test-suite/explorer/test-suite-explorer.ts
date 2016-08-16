import {Component,Output,EventEmitter} from '@angular/core';
import {NavController, Modal, AlertController} from 'ionic-angular';
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
  @Output() testSuiteClick = new EventEmitter();
  private testSuiteService: TestSuiteService;
  private testsSuiteInfo: Array<TestSuiteInfo> = [];
  constructor(private nav: NavController,private alertController: AlertController, testSuiteService: TestSuiteServiceImpl) {
    console.log('explorer initialized')
    this.testSuiteService = testSuiteService;
  }



  goToTestSuiteImporter() {

    this.nav.push(TestSuiteImporter)
  }

  filter(testsuitename:string){
     console.log('filtering');
  }

  onTestSuiteClick(testSuiteInfo: TestSuiteInfo){
   console.log("Test suite ["+testSuiteInfo.testSuite.getName()+"] clicked")
   this.testSuiteClick.emit(testSuiteInfo.testSuite);

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

  delete(testSuiteInfo : TestSuiteInfo){
 let alert = this.alertController.create({
            title: "Confirmation Requested",
            
            message: "Are you sure to delete test suite "+testSuiteInfo.testSuite.getName(),
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
            console.log('Agree clicked');
            this.testSuiteService.delete(testSuiteInfo.testSuite,(testsuite:TestSuite)=>{
              let index = this.testsSuiteInfo.indexOf(testSuiteInfo);
                this.testsSuiteInfo.splice(index, 1);

            })
          }
        }
      ]
        });
        alert.present();
  }

}

export class TestSuiteInfo {
  testSuite: TestSuite;
  tiles: Array<Tile> = [];
  constructor() { }
}