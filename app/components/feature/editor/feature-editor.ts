import {FeatureCreationError} from '../../../error/FeatureCreationError';
import {ViewController, NavParams, Events, NavController, AlertController} from 'ionic-angular';
import {Component, OnInit, Input, ViewChild, AfterViewInit} from '@angular/core';
import {Feature} from '../../../models/Feature';
import {Editor, Annotation, KeyBinding, BindKey} from './editor';

import {FeatureServiceImpl} from '../../../services/feature/FeatureServiceImpl';
import {FeatureService} from '../../../services/feature/FeatureService';
import {FeatureRepository} from '../../../repository/FeatureRepository';
import {FileSystem} from '../../../services/storage/FileSystem';
import {SettingsServiceImpl} from '../../../services/settings/SettingsServiceImpl';
import {TestSuite} from '../../../models/TestSuite';
import {DashboardPage} from '../../dashboard/DashboardPage'
import {GherkinBeautifier} from '../../../services/gherkin/GherkinBeautifier'



@Component({
  selector: 'tsp-feature-editor',
  directives: [Editor],
  templateUrl: `build/components/feature/editor/feature-editor.html`,
  providers: [FeatureServiceImpl, FeatureRepository, FileSystem, SettingsServiceImpl, GherkinBeautifier]
})
export class FeatureEditor implements OnInit, AfterViewInit {
  @Input() feature: Feature;
  @Input() filepath: string;
  @Input() testsuitename: string;

  @ViewChild("editorref") editor: Editor

  private createMode: boolean = true
  private text: string
  private options: Object
  private featureService: FeatureService
  private hasCompileErrors = false
  private storedFeature: Feature
  private dirty = false

  constructor(private nav: NavController,
    private viewCtrl: ViewController,
    featureService: FeatureServiceImpl,
    private navParams: NavParams,
    private events: Events,
    private alertController: AlertController,
    private gherkinBeautifier: GherkinBeautifier,
    private fileSystem: FileSystem) {
    this.featureService = featureService

    this.options = {
      enableBasicAutocompletion: true,
      //enableSnippets: true,
      enableLiveAutocompletion: false,
      //fontSize : 15,
      spellcheck: true
    }



  }


  ngOnInit() {

    if (this.feature) {
      this.createMode = false
      this.filepath = this.feature.getFileInfo().getFileAbsolutePath()
      this.testsuitename = this.feature.getTestSuiteName()
      this.storedFeature = this.feature
    } else if ((this.filepath != undefined && this.filepath.length > 0) && (this.testsuitename != undefined || this.testsuitename.length > 0)) {
      this.createMode = true
    } else {
      throw new Error("new feature filepath is empty or/and testsuite is empty")
    }

    if (!this.createMode)
      this.text = this.featureService.getTextFromFile(this.filepath)
  }

  ngAfterViewInit() {

    let saveKeyBinding: KeyBinding = {
      name: 'save',
      bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
      exec: (editor) => {
        this.save()
      }
    }
    this.editor.addkeyBinding(saveKeyBinding)

    let formatKeyBinding: KeyBinding = {
      name: 'format',
      bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
      exec: (editor) => {
        this.format(null)
      }
    }
    this.editor.addkeyBinding(formatKeyBinding)

    let exitKeyBinding: KeyBinding = {
      name: 'exit',
      bindKey: { win: 'Ctrl-E', mac: 'Command-E' },
      exec: (editor) => {
        this.exit(null)
      }
    }
    this.editor.addkeyBinding(exitKeyBinding)

  }

  onChange(data): void {
    this.editor.clearAnnotations()
    this.text = data
    this.dirty = true

    if (this.text === undefined || this.text === '')
      return

    try {
      this.featureService.parseGherkinText(this.text)
      this.hasCompileErrors = false
    } catch (e) {
      this.hasCompileErrors = true
      if (e.name !== 'CompositeParserException' && e.name !== 'FeatureCreationError') {
        throw e; // something unexpected happened other than a parse error
      }

      let annotations: Array<Annotation> = []
      if (e.name === 'CompositeParserException')
        annotations = this.buildAnnotionsFromParserError(e)
      if (e.name === 'FeatureCreationError')
        annotations = this.buildAnnotionFromFeatureCreationError(e)

      this.editor.addAnnotations(annotations)
    }

  }

  format($event) {
    this.text = this.gherkinBeautifier.beautifyText(this.text)
  }

  save() {
    if (this.hasCompileErrors)
      return

    let detachedFeature: Feature = this.featureService.parseGherkinText(this.text)
    detachedFeature.setTestSuiteName(this.testsuitename)

    if (this.createMode) {
      //Create file for the first time
      this.fileSystem.createFile(this.filepath)
      this.createMode = false
      this.events.publish("feature:create", detachedFeature)
    }

    if (this.storedFeature)
      detachedFeature.setRevision(this.storedFeature.getRevision())
   
    this.featureService.store(detachedFeature, this.filepath, this.text, (feature: Feature) => {
      console.log('Feature [' + feature.getId() + ',' + feature.getFileInfo().getFilename() + '] saved ');
      this.storedFeature = feature
      this.dirty = false
    })
   

  }

  buildAnnotionsFromParserError(gherkinErrors): Array<Annotation> {
    let annotations: Array<Annotation> = []
    gherkinErrors.errors.forEach(error => {
      annotations.push({
        row: error.location.line - 1, // must be 0 based
        column: error.location.column,  // must be 0 based
        text: error.message,  // text to show in tooltip
        type: "error" //"error"|"warning"|"info"
      })
    })
    return annotations
  }

  buildAnnotionFromFeatureCreationError(featureError: FeatureCreationError): Array<Annotation> {
    let annotations: Array<Annotation> = []

    annotations.push({
      row: featureError.Row,
      column: featureError.Column,
      text: featureError.getDetail().getDescription() + " " + featureError.getDetail().getResolutionHint(),
      type: "error"
    })
    return annotations
  }

  exit($event) {
    let alert = this.alertController.create({
      title: "Confirmation Requested",

      message: "There are unsaved changes. Exit without save ? ",
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.nav.pop().then(() => {
              this.events.publish('feature:update', this.storedFeature);
            })

          }
        }]
    });

    if (this.dirty) {
      alert.present();
    } else {
      this.nav.pop().then(() => {
        this.events.publish('feature:update', this.storedFeature);
      })
      //this.nav.push(DashboardPage, { feature: this.storedFeature })
    }

  }

}