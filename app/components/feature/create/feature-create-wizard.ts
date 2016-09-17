import {Feature} from '../../../models/Feature';
import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Slides, NavController, NavParams, ViewController} from 'ionic-angular';
import {FileSystem} from '../../../services/storage/FileSystem';
import {FeatureCreate} from './feature-create';
import {TestSuite} from '../../../models/TestSuite';
import {TestSuiteTree} from './testsuite-tree';


@Component({
    directives: [TestSuiteTree],
    templateUrl: 'build/components/feature/create/feature-create-wizard.html',
    providers: [FileSystem]
})
export class FeatureCreateWizard {
    private testsuite: TestSuite
    private folderPath: string = ''
    private featureFilename: string
    private featureFilepath: string
    private canSlideToFolderSelect: boolean = false
    private canStartFeatureEdit: boolean = false
    private folderSelected: boolean = false


    private featureForm: FormGroup;

    //@ViewChild('wizard') slider: Slides;

    constructor(private nav: NavController, private navParams: NavParams,
        private viewCtrl: ViewController, private formBuilder: FormBuilder,
        private fileSystem: FileSystem
    ) {

        this.testsuite = this.navParams.get("testSuite")

        /*
        this.settingsService = settingsService
        this.tcmService = injector.get(JiraTCM)
        this.tcmSettings = this.settingsService.getTestCaseManegementSettings()
        this.feature = <Feature>this.navParams.data
        this.tcmId = this.feature.getTCMId()*/

        this.featureForm = formBuilder.group({
            name: ['', Validators.compose([Validators.minLength(5), Validators.required])]
        });

    }


    public onFeatureFileNameChanged() {
        if (!this.featureForm.valid) {
            this.canStartFeatureEdit = false
            return
        }

        if (this.folderSelected)
            this.canStartFeatureEdit = true
        this.featureFilename = this.featureForm.controls['name'].value + '.feature'
        // this.canSlideToFolderSelect = true
        this.featureFilepath = this.folderPath + this.fileSystem.fileSeparator() + this.featureFilename

    }

    /*
        private goToNext() {
            if(this.canSlideToFolderSelect)
                this.slider.slideNext()
    
        }
        */

    private cancel() {
        this.viewCtrl.dismiss()
    }
    public onFolderCreated(folderPath: string) {
        /* this.folderPath = folderPath
 
         //try to create the folder
         this.fileSystem.createFolder(folderPath)
         this.canStartFeatureEdit = true */
    }

    public onFolderSelected(folderPath: string) {
        this.folderPath = folderPath
        this.featureFilepath = this.folderPath + this.fileSystem.fileSeparator() + this.featureFilename
        if (this.featureForm.valid)
            this.canStartFeatureEdit = true
        this.folderSelected = true
    }

    public editFeature() {
        this.fileSystem.createFile(this.featureFilepath)
        this.viewCtrl.dismiss().then(() => {
            this.nav.push(FeatureCreate, { testsuite: this.testsuite, folderPath: this.folderPath, featureFilename: this.featureFilename, featureFilepath: this.featureFilepath })
        })



    }

}