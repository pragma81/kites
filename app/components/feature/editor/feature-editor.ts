import { FeatureCreationError } from '../../../error/FeatureCreationError';
import { ViewController, NavParams, Events, NavController, AlertController } from 'ionic-angular';
import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { Feature, GherkinAST } from '../../../models/Feature';
import { Editor, Annotation, KeyBinding, BindKey } from './editor';

import { FeatureServiceImpl } from '../../../services/feature/FeatureServiceImpl';
import { FeatureService } from '../../../services/feature/FeatureService';
import { FeatureRepository } from '../../../repository/FeatureRepository';
import { FileSystem } from '../../../services/storage/FileSystem';
import { SettingsServiceImpl } from '../../../services/settings/SettingsServiceImpl';
import { TestSuite } from '../../../models/TestSuite';
import { DashboardPage } from '../../dashboard/DashboardPage'
import { GherkinBeautifier } from '../../../services/gherkin/GherkinBeautifier'



@Component({
  selector: 'tsp-feature-editor',
  directives: [Editor],
  templateUrl: `build/components/feature/editor/feature-editor.html`,
  providers: [GherkinBeautifier]
})
export class FeatureEditor implements OnInit, AfterViewInit {
  @Input() feature: Feature;
  @Input() filepath: string;
  @Input() testsuitename: string;
  @Input() templateText: string

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
      //enableBasicAutocompletion: true,
      //enableSnippets: true,
      //enableLiveAutocompletion: false,
      //fontSize : 15,
      //spellcheck: true
    }



  }


  ngOnInit() {

    if (this.feature) {
      this.createMode = false
      this.filepath = this.feature.getFileInfo().getFileAbsolutePath()
      this.testsuitename = this.feature.getTestSuiteName()
      this.storedFeature = this.feature
    } else if ((this.filepath != undefined && this.filepath.length > 0)
      && (this.testsuitename != undefined || this.testsuitename.length > 0)) {
      this.createMode = true
    } else {
      throw new Error("new feature filepath is empty or/and testsuite is empty")
    }

    if (!this.createMode)
      this.text = this.featureService.getTextFromFile(this.filepath)
    else
      this.text = this.templateText
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
      bindKey: { win: 'Alt-F', mac: 'Alt-F' },
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

    let zoominKeyBinding: KeyBinding = {
      name: 'zoomin',
      bindKey: { win: 'Ctrl-1', mac: 'Command-1' },
      exec: (editor) => {
        editor.setFontSize(editor.getFontSize() + 2)
      }
    }
    this.editor.addkeyBinding(zoominKeyBinding)

    let zoomoutKeyBinding: KeyBinding = {
      name: 'zoomout',
      bindKey: { win: 'Ctrl-2', mac: 'Command-2' },
      exec: (editor) => {
        editor.setFontSize(editor.getFontSize() - 2)
      }
    }
    this.editor.addkeyBinding(zoomoutKeyBinding)
  }

  onChange(data): void {
    this.editor.clearAnnotations()
    this.text = data
    this.dirty = true

    if (this.text === undefined || this.text === '')
      return

    try {
      let gherkinAST = this.featureService.parseGherkinText(this.text)
      
      //Try to build a feature
      let feature = new Feature(gherkinAST,this.testsuitename)
      
      this.validateFeatureUniqueness(gherkinAST, this.testsuitename)
      this.hasCompileErrors = false
    } catch (e) {
      this.hasCompileErrors = true
      let annotations: Array<Annotation> = []

      if (e.name === 'CompositeParserException') {
        annotations = this.buildAnnotionsFromParserError(e)
      } else if (e.name === 'FeatureCreationError') {
        annotations = this.buildAnnotionFromFeatureCreationError(e)
      } else {
        let currentRowPosition = (<any>this.editor.getCursorPosition()).row
        annotations = this.buildAnnotionsFromGenericError(e, currentRowPosition)
      }

      setTimeout(() => {
        this.editor.addAnnotations(annotations)
      }, 100);


    }

  }

  format($event) {
    let currentRowPosition = (<any>this.editor.getCursorPosition()).row
    let currentColumnPosition = (<any>this.editor.getCursorPosition()).column
    this.text = this.gherkinBeautifier.beautifyText(this.text)
    //

    setTimeout(() => {
      this.editor.moveCursorPosition(currentRowPosition, currentColumnPosition)
    }, 100);
  }

  save() {
    if (this.hasCompileErrors)
      return

    let gherkinAST = this.featureService.parseGherkinText(this.text)
    let detachedFeature: Feature = new Feature(gherkinAST, this.testsuitename)


    if (this.createMode) {
      //Create file for the first time in synch mode
      this.fileSystem.createFile(this.filepath)

    }

    if (this.storedFeature)
      detachedFeature.setRevision(this.storedFeature.getRevision())

    this.featureService.store(detachedFeature, this.filepath, this.text, (feature: Feature) => {
      console.log('Feature [' + feature.getId() + ',' + feature.getFileInfo().getFilename() + '] saved ');
      this.storedFeature = feature
      this.dirty = false
      if (this.createMode) {
        this.createMode = false
        this.events.publish("feature:create", this.storedFeature)
      }

    })


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
              setTimeout(()=>{
                this.events.publish('feature:update', { testsuitename: this.testsuitename, feature: this.storedFeature });
              },100)
              
            })

          }
        }]
    });

    if (this.dirty) {
      alert.present();
    } else {
      this.nav.pop().then(() => {
        this.events.publish('feature:update', { testsuitename: this.testsuitename, feature: this.storedFeature });
      })
      //this.nav.push(DashboardPage, { feature: this.storedFeature })
    }

  }

  private validateFeatureUniqueness(gherkinAST: GherkinAST, testsuitename: string) {
    let featuretags = gherkinAST.ast.feature.tags
    if (!featuretags)
      return

    let featureAST = featuretags.find(function (value, index, array) {
      let valueAny: any = value;
      let tagSplit = valueAny.name.split('=');
      return tagSplit[0] === '@featureid'

    })

    if(!featureAST)
    return
    let featureId = featureAST.name.split('=')[1];
    let tempStoreFeatureid = featureId + ":" + this.testsuitename

    //check featureid is dirty
    if (this.storedFeature && (tempStoreFeatureid === this.storedFeature.getId()))
      return


    let exists = this.featureService.exists(tempStoreFeatureid, feature => {
      let annotations: Array<Annotation> = []

      annotations.push({
        row: 0,
        column: 0,
        text: featureId + " already exists",
        type: "error"
      })

      this.editor.addAnnotations(annotations)
      this.hasCompileErrors = true
    }, () => { })


  }

  private buildAnnotionsFromParserError(gherkinErrors): Array<Annotation> {
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

  private buildAnnotionFromFeatureCreationError(featureError: FeatureCreationError): Array<Annotation> {
    let annotations: Array<Annotation> = []

    annotations.push({
      row: featureError.Row,
      column: featureError.Column,
      text: featureError.getDetail().getDescription() + " " + featureError.getDetail().getResolutionHint(),
      type: "error"
    })
    return annotations
  }

  private buildAnnotionsFromGenericError(error: Error, row: number): Array<Annotation> {
    let annotations: Array<Annotation> = []

    annotations.push({
      row: row,
      column: 0,
      text: error.message,
      type: "error"
    })
    return annotations
  }
}