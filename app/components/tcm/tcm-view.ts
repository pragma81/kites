import {Component, ViewChild, Injectable} from '@angular/core';
import {NavController, Events, NavParams} from 'ionic-angular';
import { SafeResourceUrl, DomSanitizationService } from '@angular/platform-browser'



@Component({
    templateUrl: 'build/components/tcm/tcm-view.html',

})
export class TCMView {
    private tcmfeatureUrl: SafeResourceUrl

    constructor(private nav: NavController, private navParams: NavParams,sanitizer: DomSanitizationService) {
        let unsafeUrl = <string>navParams.get("url")

        this.tcmfeatureUrl = sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    }


}