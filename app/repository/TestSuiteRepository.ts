import {Injectable} from '@angular/core'
import * as PouchDB from 'pouchdb';
import {TestSuite, ExecutionRuntime} from '../models/TestSuite'

//let PouchDB = require('pouchdb');

@Injectable()
export class TestSuiteRepository {

    private _db: any;

    constructor() {
        this._db = new PouchDB('texui-testsuite');
    }

    public save(testSuite: TestSuite): TestSuite {
        this._db.put(testSuite).then((response) => {
            //save revision for the first time
            if (testSuite.getRevision === undefined) {
                testSuite.setRevision(response.rev);
            }
            console.log('Test suite [' + testSuite.getId() + ',' + testSuite.getName() + ',' + testSuite.getRevision() + '] saved ');
        }).catch(function (err) {
            throw new Error('Error while saving TestSuite [' + testSuite.getId() + ',' + testSuite.getName() + ',' + testSuite.getRevision() + '] :' + err.message);
        });
        return testSuite;
    }

    delete(testsuite: TestSuite,callback:(testsuite:TestSuite)=> void): void {
        this._db.remove(testsuite.getId(), testsuite.getRevision()).then(result => {
            callback(testsuite);
        }).catch(err => {
            console.log(err);
        });
    }

    public getAll(callback:(testsuite:Array<TestSuite>)=> void): void{
        let testsSuite: Array<TestSuite> = []
        this._db.allDocs({
            include_docs: true
        }).then(result => {
            if (result.rows === undefined) {
                return
            }
            result.rows.forEach(row => {
                let testSuite = new TestSuite(row.doc.name,
                row.doc.scmSync,
                row.doc.tstSuiteRepoName,
                row.doc.testSuiteFoldername,
                row.doc.imported,
                row.doc.projectFilePath,
                row.doc.executionRuntimeType);
                testSuite.setRevision(row.doc._rev);
                testSuite.setFeatures(row.doc.features);
                testSuite.setApiTests(row.doc.apiTests);
                testSuite.setUiTests(row.doc.uiTests);
                testsSuite.push(testSuite)
            })
             callback(testsSuite)
        }).catch(err => {
            console.log(err);
        });
       
    }

}