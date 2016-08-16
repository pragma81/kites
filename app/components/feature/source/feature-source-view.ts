import {ViewController, NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {Feature} from '../../../models/Feature';


@Component({
  selector: 'tex-feature-source-view',
  templateUrl: 'build/components/feature/source/feature-source-view.html'
})
export class FeatureSourceView {
   feature : Feature;
    constructor( public viewCtrl: ViewController, private navParams: NavParams) {
    console.log("initialize NewItemModal")
    this.feature = this.navParams.get("feature")


}
}