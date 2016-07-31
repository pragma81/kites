import {Component} from '@angular/core';
import {Modal, NavController,ViewController} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/components/FeatureSearchModal.html'
})
export class FeatureSearchModal {
  private featureFilePath: string;
  constructor(
    private viewCtrl: ViewController) {}

  close() {
    this.viewCtrl.dismiss(this.featureFilePath);
  }

  onFileSelected(event){
      this.featureFilePath = event.srcElement.files[0];
  }
}