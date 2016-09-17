import {NavParams} from 'ionic-angular';
import {Component} from '@angular/core';
import {Feature} from '../../../models/Feature';
import {FeatureEditor} from '../editor/feature-editor';
import {TestSuiteTree} from './testsuite-tree';

import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../../services/feature/FeatureService';
import {FeatureRepository} from '../../../repository/FeatureRepository';
import {TestSuiteRepository} from '../../../repository/TestSuiteRepository';
import {FileSystem} from '../../../services/storage/FileSystem';
import {SettingsServiceImpl} from '../../../services/settings/SettingsServiceImpl';
import {TestSuite} from '../../../models/TestSuite';
import {AppConfig} from '../../../models/AppConfig';

require('brace/mode/gherkin');
require('brace/mode/javascript');
require('brace/theme/clouds');
require('brace/theme/monokai');

@Component({
  directives: [TestSuiteTree,FeatureEditor],
  templateUrl: `build/components/feature/create/feature-create.html`,
   providers: [FeatureServiceImpl,FeatureRepository, 
              FileSystem, SettingsServiceImpl,
              AppConfig,TestSuiteRepository]
})
export class FeatureCreate {
  private text: string
  private options: Object
  private feature: Feature
  private featureFilepath : string
  private testSuitename : string
  private featureService: FeatureService
  private testsuite: TestSuite
  constructor(featureService: FeatureServiceImpl, private navParams: NavParams) {

    this.testsuite = navParams.get('testsuite')
    this.feature = this.navParams.get("feature")
    this.featureFilepath = this.navParams.get("featureFilepath")
    
    if(this.testsuite)
      this.testSuitename = this.testsuite.getName()

    this.options = { printMargin: false };
    this.text = "prova"
  }

  onChange = (data) => {
    console.log(data);
  }
}