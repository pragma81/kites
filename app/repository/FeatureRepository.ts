import {Injectable} from '@angular/core'
import * as PouchDB from 'pouchdb-browser';
import {Feature,FileInfo} from '../models/Feature'

//let PouchDB = require('pouchdb');

declare var emit: any;
@Injectable()
export class FeatureRepository {

    private _db: any;

    constructor() {
        this._db = new PouchDB('texui-feature');
    }


    public save(feature: Feature,callback:(feature:Feature)=> void): void {
        this._db.put(feature).then(function (response) {
            //save revision for the first time
            if (feature.getRevision === undefined) {
                feature.setRevision(response.rev);
            }
            console.log('Feature [' + feature.getId() + ',' + feature.getName() + ',' + feature.getRevision() + '] saved ');
            callback(feature);
        }).catch(function (err) {
            throw new Error('Error while saving Feature [' + feature.getId() + ',' + feature.getName() + ',' + feature.getRevision() + '] :' + err.message);
        });

    }

    delete(feature: Feature,callback:(feature:Feature)=> void): void {
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

    public query(filters: Object, callback: (testsuite: Array<Feature>) => void): void {

        let pouchDbQueryOptions = {include_docs: true}
        Object.assign(pouchDbQueryOptions,filters)

        let features: Array<Feature> = []
        this._db.query(this.featureMapFunction, pouchDbQueryOptions).then(result => {
            if (result.rows === undefined) {
                return
            }
            result.rows.forEach(row => {
                let fileInfo = new FileInfo(row.doc.fileInfo.filename,row.doc.fileInfo.fileAbsolutePath,row.doc.fileInfo.creationTime,row.doc.fileInfo.updateTime)
                let feature = new Feature(row.doc.rawData,fileInfo)
                feature.setRevision(row.doc._rev)
                feature.setTestSuiteName(row.doc.testSuiteName)
                features.push(feature)
            })
            callback(features)
        }).catch(err => {
            console.log(err);
        });

    }

public queryByTestSuiteName(testSuiteName:string, callback: (testsuite: Array<Feature>) => void){

    let testSuiteMapFunction = function(doc){ emit(doc.testSuiteName)}
    let pouchDbQueryOptions = {key:testSuiteName,include_docs: true}
    
    let features: Array<Feature> = []
        this._db.query(testSuiteMapFunction, pouchDbQueryOptions).then(result => {
            if (result.rows === undefined) {
                return
            }
           result.rows.forEach(row => {
                let fileInfo = new FileInfo(row.doc.fileInfo.filename,row.doc.fileInfo.fileAbsolutePath,row.doc.fileInfo.creationTime,row.doc.fileInfo.updateTime)
                let feature = new Feature(row.doc.rawData,fileInfo)
                feature.setRevision(row.doc._rev)
                feature.setTestSuiteName(row.doc.testSuiteName)
                features.push(feature)
            })
            callback(features)
        }).catch(err => {
            console.log(err);
        });
}

}