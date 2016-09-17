import {Component, Output, EventEmitter} from '@angular/core';
import {NavController, Modal, AlertController, PopoverController, ViewController, ModalController,Events} from 'ionic-angular';
import {TestSuiteService} from '../../../services/testsuite/TestSuiteService';
import {TestSuiteServiceImpl} from '../../../services/testsuite/TestSuiteServiceImpl';
import {AppStateHolder} from '../../../services/AppStateHolder';
import {Tiles, Tile} from '../../tiles/tiles';
import {TestSuiteImporter} from '../import/test-suite-importer';
import {TestSuiteCreate} from '../create/test-suite-create';
import {TestSuite} from '../../../models/TestSuite';


@Component({
  selector: 'tex-testsuite-explorer',
  templateUrl: 'build/components/test-suite/explorer/test-suite-explorer.html',
  directives: [Tiles],
  providers: [TestSuiteServiceImpl]
})
export class TestSuiteExplorer {
  @Output() testSuiteClick = new EventEmitter();
  @Output() testSuiteDeleted = new EventEmitter()
  private testSuiteService: TestSuiteService;
  private testsSuiteInfo: Array<TestSuiteInfo> = [];
  private unfilteredTestsSuiteInfo : Array<TestSuiteInfo> = []
  private currentTestsSuiteInfo: TestSuiteInfo
  constructor(private nav: NavController,
    private alertController: AlertController,
    testSuiteService: TestSuiteServiceImpl,
    private appStateHolder: AppStateHolder,
    public popoverCtrl: PopoverController,
    private events:Events) {
    console.log('explorer initialized')
    this.testSuiteService = testSuiteService;
    this.events.subscribe('testsuite:update',()=>{
      this.load()
    })

    
  }

  goToTestSuiteImporter() {

    this.nav.push(TestSuiteImporter)
  }

  filter(event:any) {
    console.log('filtering');
    this.testsSuiteInfo = this.unfilteredTestsSuiteInfo
      // set val to the value of the searchbar
    let val = event.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.testsSuiteInfo = this.testsSuiteInfo.filter((testSuiteInto) => {
        return (testSuiteInto.testSuite.getName().toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

  onTestSuiteClick(testSuiteInfo: TestSuiteInfo) {
    console.log("Test suite [" + testSuiteInfo.testSuite.getName() + "] clicked")
    this.appStateHolder.currentTestSuite = testSuiteInfo.testSuite
    this.testSuiteClick.emit(testSuiteInfo.testSuite);

  }

  load() {
    this.testsSuiteInfo.length = 0
    this.unfilteredTestsSuiteInfo.length = 0
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
          this.unfilteredTestsSuiteInfo.push(testSuiteInfo)
        })

        /* TO-FIX even if AppStateHolder is declared at parent level (DashboardPage) using providers,
        * the state of the app holder is lost on every test-suite explorer call
        
        if (this.appStateHolder.currentTestSuite)
          this.testSuiteClick.emit(this.currentTestsSuiteInfo.testSuite);
          */
      })


  }

  delete(testSuiteInfo: TestSuiteInfo) {
    let alert = this.alertController.create({
      title: "Confirmation Requested",

      message: "Are you sure to delete test suite " + testSuiteInfo.testSuite.getName(),
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
            this.testSuiteService.delete(testSuiteInfo.testSuite, (testsuite: TestSuite) => {
              let index = this.testsSuiteInfo.indexOf(testSuiteInfo);
              this.testsSuiteInfo.splice(index, 1);
              this.unfilteredTestsSuiteInfo.splice(index,1)
              //this.testSuiteDeleted.emit(testsuite)

            })
          }
        }
      ]
    });
    alert.present();
  }


  showAddTestSuiteMenu(event) {
    let popover = this.popoverCtrl.create(AddTestSuiteMenu,
      {},
      { cssClass: 'testsuite-popover' });

    popover.present({
      ev: event,

    });
  }


}


export class TestSuiteInfo {
  testSuite: TestSuite;
  tiles: Array<Tile> = [];
  constructor() { }
}


@Component({
  template: `
        <button  block clear (click)="openCreateTestSuite()"><ion-icon name="ios-folder-outline" large ></ion-icon> Create</button>
       <button block clear (click)="openImportTestSuite()"><ion-icon  name="ios-folder-open-outline" large ></ion-icon> Import</button>
      `
})
export class AddTestSuiteMenu {

  constructor(private nav: NavController, private viewCtrl: ViewController, private modalController: ModalController) { }
  openCreateTestSuite() {
    let testSuite = this.viewCtrl.data.testSuite
    //this.nav.push(FeatureCreate, {testSuite : testSuite})
    const modal = this.modalController.create(TestSuiteCreate, { "testSuite": testSuite });
    this.viewCtrl.dismiss().then(()=>{
    modal.present()
    })
   

  }

  openImportTestSuite() {
    const modal = this.modalController.create(TestSuiteImporter);
     this.viewCtrl.dismiss().then(()=>{
    modal.present()
    })

  }


}