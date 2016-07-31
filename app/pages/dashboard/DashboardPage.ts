import {Component, ViewChild, ElementRef} from '@angular/core';
import {Modal, NavController} from 'ionic-angular'
import {FeatureSearchModal} from './FeatureSearchModal'
import {Tiles,Tile} from '../common/tiles'
import * as fs from 'fs'
import * as hljs from 'highlight.js'

declare var Gherkin : any ;

@Component({
  templateUrl: 'build/pages/dashboard/DashboardPage.html',
  directives : [Tiles],
  providers : [Tile]

})
export class DashboardPage {

  private testSuiteTiles : Array<Tile> =[];

  public fileText: string = "";
  public gherkinhljs: string;
  @ViewChild('hljsarea') textRef: ElementRef;
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

  showSearchModal() {
    let modal = Modal.create(FeatureSearchModal);
    modal.onDismiss(file => {
      console.log(file.name);
      console.log(file.path);
      console.log(window['ipc']);
      const fs = window['fs'];
      let ref = this;
      fs.readFile(file.path, 'utf-8', function (err, data) {
        if (err) {
          alert("An error ocurred reading the file :" + err.message);
          return;
        }
        ref.fileText = data;
      });
      console.log(ref.fileText);
      let result: hljs.IHighlightResult = hljs.highlight('gherkin', ref.fileText, true);
      ref.gherkinhljs = result.value;

      this.parse(ref.fileText);

    });

    this.nav.present(modal);
  }

  parse(featureFileText) {
   
    var parser = new Gherkin.Parser();
    parser.stopAtFirstError = false;
        var ast = parser.parse(featureFileText);
        var result = JSON.stringify(ast, null, 2);
      console.log(result);
      
  }
}
