import {Component,provide,ExceptionHandler} from '@angular/core';

import { Platform, ionicBootstrap,ToastController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {DashboardPage} from './components/dashboard/DashboardPage';
import {FileSystem} from './services/storage/FileSystem';
import {GherkinService} from './services/gherkin/GherkinService';
import {SettingsServiceImpl} from './services/settings/SettingsServiceImpl';
import {FeatureServiceImpl} from './services/feature/FeatureServiceImpl';
import {TestSuiteRepository} from './repository/TestSuiteRepository';
import {FeatureRepository} from './repository/FeatureRepository';
import {AppConfig} from './models/AppConfig';
import {GlobalExceptionHandler} from './error/GlobalExceptionHandler';



declare var nodeRequire: any

@Component({
  templateUrl: 'build/app.html',
  providers: [FileSystem, GherkinService, FeatureServiceImpl,
    TestSuiteRepository, FeatureRepository, SettingsServiceImpl, AppConfig,ToastController]
})
class App {

  // make Dashboard the root (or first) page
  rootPage: any = DashboardPage;
   
  constructor(private platform: Platform) {
    this.initializeApp();
   
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //StatusBar.styleDefault();
      /*
       window.addEventListener('error', function (e: any) {
      var error = e.error;
      let dialog = nodeRequire('electron').remote.dialog
      dialog.showErrorBox("Unexpected Error: " + e.name, e.stack)
      
    }); */
    });
  }

} 

  ionicBootstrap(App, [provide(ExceptionHandler, { useClass: GlobalExceptionHandler })]);
