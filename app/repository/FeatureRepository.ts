import {Injectable} from '@angular/core'
import * as PouchDB from 'pouchdb';
import {Feature} from '../models/Feature'

//let PouchDB = require('pouchdb');

@Injectable()
export class FeatureRepository {

    private _db: any;

    constructor() {
        this._db = new PouchDB('texui-feature');
    }


    public save(feature: Feature): Feature {
        this._db.put(feature).then(function (response) {
            //save revision for the first time
            if (feature.getRevision === undefined) {
                feature.setRevision(response.rev);
            }
            console.log('Feature [' + feature.getId() + ',' + feature.getName() + ',' + feature.getRevision + '] saved ');
        }).catch(function (err) {
            throw new Error('Error while saving Feature [' + feature.getId() + ',' + feature.getName() + ',' + feature.getRevision + '] :' + err.message);
        });
        return feature;

    }
}