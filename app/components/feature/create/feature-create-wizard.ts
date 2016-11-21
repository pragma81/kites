import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { FileSystem } from '../../../services/storage/FileSystem';
import { FeatureService } from '../../../services/feature/FeatureService';
import { FeatureServiceImpl } from '../../../services/feature/FeatureServiceImpl';
import { SettingsServiceImpl } from '../../../services/settings/SettingsServiceImpl';
import { FeatureRepository } from '../../../repository/FeatureRepository';
import { TestSuiteRepository } from '../../../repository/TestSuiteRepository';
import { AppConfig } from '../../../models/AppConfig';
import { JiraTCM } from '../../../services/tcm/JiraTCM';
import { Feature } from '../../../models/Feature';
import { FeatureCreate } from './feature-create';
import { TestSuite } from '../../../models/TestSuite';
import { TestSuiteTree } from './testsuite-tree';

declare var nodeRequire: any

@Component({
    directives: [TestSuiteTree],
    templateUrl: 'build/components/feature/create/feature-create-wizard.html'
})
export class FeatureCreateWizard {
    private testsuite: TestSuite
    private featureService: FeatureService
    private folderPath: string = ''
    private featureFilename: string
    private featureFilepath: string
    private featureId: string
    private canSlideToFolderSelect: boolean = false
    private canStartFeatureEdit: boolean = false
    private folderSelected: boolean = false
    private featureIdTouched: boolean = false
    private filePathExists:boolean = false

    private featureForm: FormGroup;

    constructor(private nav: NavController, private navParams: NavParams,
        private viewCtrl: ViewController, private formBuilder: FormBuilder,
        private fileSystem: FileSystem, featureService: FeatureServiceImpl) {

        this.testsuite = this.navParams.get("testSuite")
        this.featureService = featureService

        this.featureForm = formBuilder.group({
            name: ['', Validators.compose([Validators.minLength(5), Validators.required, this.validateFileName.bind(this)])],
            id: ['', Validators.compose([Validators.minLength(5), Validators.required]), this.validatefeatureId.bind(this)]
        });

    }


    public onFeatureFileNameChanged() {

        this.featureFilename = this.featureForm.controls['name'].value + '.feature'
        this.featureFilepath = (this.folderPath ? this.folderPath : "") + this.fileSystem.fileSeparator() + this.featureFilename

        if (this.featureForm.valid && this.folderSelected)
            this.canStartFeatureEdit = true
            else
            this.canStartFeatureEdit = false
    }

    public onFeatureIdChanged() {

        this.featureId = this.featureForm.controls['id'].value

      if (this.featureForm.valid && this.folderSelected)
            this.canStartFeatureEdit = true
            else
            this.canStartFeatureEdit = false

    }


    private cancel() {
        this.viewCtrl.dismiss()
    }

    private selectDirectory() {

        this.folderPath = nodeRequire('electron').remote.dialog.showOpenDialog({
            defaultPath: this.testsuite.TestSuiteDir,
            properties: ['openDirectory', 'createDirectory']
        })

        this.folderSelected = true
        this.featureFilepath = this.folderPath + this.fileSystem.fileSeparator() + (this.featureFilename ? this.featureFilename : "")

        if(this.featureFilename && this.featureService.fileExists(this.featureFilepath)){
            this.filePathExists = true
            return
        } else {
             this.filePathExists = false
        }
            
        if (this.featureForm.valid)
            this.canStartFeatureEdit = true
    }

    private validateFileName(c: FormControl) {
        if (c.value === "")
            return null
        
        this.filePathExists = false
        this.featureFilepath = this.folderPath + this.fileSystem.fileSeparator() + c.value + ".feature"
        let exists = this.featureService.fileExists(this.featureFilepath) 
       
        return exists ?  { validateFileName: { valid: false} }: null
    }

    private validatefeatureId(c: FormControl) {

        return new Promise(resolve => {
            let storedfeatureId = c.value + ":" + this.testsuite.getName()
            this.featureService.exists(storedfeatureId, (feature) => {
                resolve({ "validatefeatureId": true })
            }, () => {
                resolve(null)
            })
        })

    }

    public editFeature() {
        this.viewCtrl.dismiss().then(() => {
            this.nav.push(FeatureCreate, { testsuite: this.testsuite, folderPath: this.folderPath, featureFilename: this.featureFilename, featureFilepath: this.featureFilepath, featureId: this.featureId })
        })



    }

}