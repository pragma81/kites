import { Injectable } from '@angular/core'
import * as PouchDB from 'pouchdb-browser';
import { Feature, FileInfo } from '../models/Feature'

//let PouchDB = require('pouchdb');

declare var emit: any;
@Injectable()
export class FeatureRepository {

    private _db: any;

    constructor() {
        this._db = new PouchDB('kites-feature');
    }


    public save(feature: Feature, callback: (feature: Feature) => void): void {

        //create feature id pouchdb id as featureid  + testuitename

        //let storedFeature: any = JSON.parse(JSON.stringify(feature))
        let storedFeature :any = feature
        storedFeature['_id'] = storedFeature['_id'] + ":" + storedFeature['testSuiteName']
        this._db.put(storedFeature).then(function (response) {
            //save revision for the first time
           // if (feature.getRevision === undefined) {
                feature.setRevision(response.rev);
            //}
            console.log('Feature [' + feature.getId() + ',' + feature.getName() + ',' + feature.getRevision() + '] saved ');
            callback(feature);
        }).catch(function (err) {
            throw new Error('Error while saving Feature [' + feature.getId() + ',' + feature.getName() + ',' + feature.getRevision() + '] :' + err.message);
        });

    }

    delete(feature: Feature, callback: (feature: Feature) => void): void {

        let featureid = feature.getId() + ":" + feature.getTestSuiteName()
        this._db.remove(featureid, feature.getRevision()).then(result => {
            callback(feature);
        }).catch(err => {
            console.log(err);
        });
    }

    private featureMapFunction(doc) {

        // emit(doc.name, doc.testSuiteName, doc.description, doc.type)
        emit(doc.testSuiteName)
    }


    public queryByTestSuiteName(testSuiteName: string, callback: (testsuite: Array<Feature>) => void) {

        let testSuiteMapFunction = function (doc) { emit(doc.testSuiteName) }
        let pouchDbQueryOptions = { key: testSuiteName, include_docs: true }

        let features: Array<Feature> = []
        this._db.query(testSuiteMapFunction, pouchDbQueryOptions).then(result => {
            if (result.rows === undefined) {
                return
            }
            result.rows.forEach(row => {
                let fileInfo = new FileInfo(row.doc.fileInfo.filename, row.doc.fileInfo.fileAbsolutePath, row.doc.fileInfo.creationTime, row.doc.fileInfo.updateTime)
                let feature = new Feature(row.doc.rawData, fileInfo)
                feature.setRevision(row.doc._rev)
                feature.setTestSuiteName(row.doc.testSuiteName)
                features.push(feature)
            })
            callback(features)
        }).catch(err => {
            console.log(err);
        });
    }

    public findById(featureid: string, callback: (feature: Feature) => void, errorcallback: (error: Error) => void) {

        this._db.get(featureid).then(doc => {

            let fileInfo = new FileInfo(doc.fileInfo.filename, doc.fileInfo.fileAbsolutePath, doc.fileInfo.creationTime, doc.fileInfo.updateTime)
        let feature = new Feature(doc.rawData, fileInfo)
        feature.setRevision(doc._rev)
        feature.setTestSuiteName(doc.testSuiteName)
            callback(feature)
        }).catch(err => {
            console.log(err);
            errorcallback(err)
        });

    }


}
