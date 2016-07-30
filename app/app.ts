import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Platform, MenuController, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {DashboardPage} from './pages/dashboard/DashboardPage';



@Component({
  templateUrl: 'build/app.html'
})
class MyApp {

  // make Dashboard the root (or first) page
  rootPage: any = DashboardPage;

  constructor(
    private platform: Platform
  ) {
    this.initializeApp();
    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //StatusBar.styleDefault();
    });
  }

}

ionicBootstrap(MyApp);
