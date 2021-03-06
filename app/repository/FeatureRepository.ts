import { Injectable } from '@angular/core'
import * as PouchDB from 'pouchdb-browser';
import { Feature } from '../models/Feature'
import { FileInfo } from '../models/FileInfo'


//let PouchDB = require('pouchdb');

declare var emit: any;
@Injectable()
export class FeatureRepository {

    private _db: any;

    constructor() {
        this._db = new PouchDB('kites-feature');
    }


    public save(feature: Feature, callback: (feature: Feature) => void): void {


        this._db.put(feature).then(function (response) {
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

      
        this._db.remove(feature.getId(), feature.getRevision()).then(result => {
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
                let feature = new Feature({ast:row.doc.rawData},row.doc.testSuiteName, fileInfo)
                feature.setRevision(row.doc._rev)
                features.push(feature)
            })
            callback(features)
        }).catch(err => {
         throw new Error('Error while reading feature files for test suite  [' + testSuiteName +'] :' + err.message);
        });
    }

    public findById(featureid: string, callback: (feature: Feature) => void, errorcallback: (error: Error) => void) {

        this._db.get(featureid).then(doc => {

            let fileInfo = new FileInfo(doc.fileInfo.filename, doc.fileInfo.fileAbsolutePath, doc.fileInfo.creationTime, doc.fileInfo.updateTime)
        let feature = new Feature({ast:doc.rawData},doc.testSuiteName, fileInfo)
        feature.setRevision(doc._rev)
            callback(feature)
        }).catch(err => {
            console.log(err);
            errorcallback(err)
        });

    }


}
