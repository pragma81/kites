import {Component, ViewChild, ElementRef} from '@angular/core';
import {Modal, NavController} from 'ionic-angular'
import {TestSuiteExplorer} from '../test-suite/explorer/test-suite-explorer'
import {Tiles,Tile} from '../tiles/tiles'
import * as fs from 'fs'
import * as hljs from 'highlight.js'

declare var Gherkin : any ;

@Component({
  templateUrl: 'build/components/dashboard/DashboardPage.html',
  directives : [Tiles,TestSuiteExplorer],
  providers : [Tile]

})
export class DashboardPage {
   @ViewChild(TestSuiteExplorer)
  private testSuiteExplorer : TestSuiteExplorer;
  private testSuiteTiles : Array<Tile> =[];

  public fileText: string = "";
  //public gherkinhljs: string;
  //@ViewChild('hljsarea') textRef: ElementRef;
  constructor(private nav: NavController) {
    let featureTile = new Tile(13,'Features');
    let apiTile = new Tile(6,'UI');
    let uiTile = new Tile(3,'API');
    this.testSuiteTiles.push(featureTile);
    this.testSuiteTiles.push(apiTile);
     this.testSuiteTiles.push(uiTile);
    
    let options: hljs.IOptions = { languages: ['gherkin'] };
    hljs.configure(options);
  }

ionViewDidEnter(){
  console.log ('entered in dashboard')
  this.testSuiteExplorer.load();
}
}
