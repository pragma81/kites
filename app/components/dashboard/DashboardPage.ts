import {Component, ViewChild, ElementRef} from '@angular/core';
import {Modal, NavController, } from 'ionic-angular'
import {FeatureSearchModal} from './FeatureSearchModal'
import * as fs from 'fs'
import * as hljs from 'highlight.js'

declare var Gherkin : any ;

@Component({
  templateUrl: 'build/components/dashboard/DashboardPage.html'
})
export class DashboardPage {
  
  public fileText: string = "";
  public gherkinhljs: string;
  @ViewChild('hljsarea') textRef: ElementRef;
  constructor(private nav: NavController) {
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
