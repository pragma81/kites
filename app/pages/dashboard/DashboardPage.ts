import {Component} from '@angular/core';
import {Modal, NavController, } from 'ionic-angular'
import {FeatureSearchModal} from './FeatureSearchModal'
import * as fs from 'fs'

@Component({
  templateUrl: 'build/pages/dashboard/DashboardPage.html'
})
export class DashboardPage {
   constructor(private nav: NavController){

   }

  showSearchModal(){
      let modal = Modal.create(FeatureSearchModal);
    modal.onDismiss(file => {
     console.log(file.name);
     console.log(file.path);
     console.log(window['ipc']);
    const fs = window['fs'];
   
     let result = fs.readFileSync(file.path,'utf8');
     
     fs.readFile(file.path, 'utf-8', function (err, data) {
                    if(err){
                        alert("An error ocurred reading the file :" + err.message);
                        return;
                    }
                    
                    console.log(data);
     }); 
   });
    this.nav.present(modal);
  }
}
