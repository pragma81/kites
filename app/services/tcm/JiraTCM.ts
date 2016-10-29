import {Scenario} from '../../models/Scenario';
import {Injectable} from '@angular/core';
import {RequestOptions, Http, Headers, Response} from '@angular/http';
import { Observable}     from 'rxjs/Observable';
import {BehaviorSubject} from "rxjs/Rx";
import {RxHTTPErrorHandler} from '../../error/RxHTTPErrorHandler';
import {FeatureTCM} from '../../models/tcm/FeatureTCM'
import {Feature} from '../../models/Feature';
import {TCMService} from './TCMService';
import {SettingsServiceImpl} from '../settings/SettingsServiceImpl';
import {SettingsService} from '../settings/SettingsService';
import {TCMSettings} from '../../models/TCMSettings';
import {TestCase} from '../../models/tcm/TestCase';
import * as Mustache from 'mustache'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/forkJoin'


@Injectable()
export class JiraTCM implements TCMService {
    private client: any
    private settingsService: SettingsService
    private tcmSettings: TCMSettings
    private baseApiUrl: string
    private requestOptions: RequestOptions

    constructor(private http: Http, settingsService: SettingsServiceImpl) {
        this.settingsService = settingsService
        this.tcmSettings = settingsService.getTestCaseManegementSettings()
        let basicAuthToken = this.tcmSettings.Username + ':' + this.tcmSettings.Password

        this.baseApiUrl = this.tcmSettings.Protocol + '://' + this.tcmSettings.Url + '/rest/api/2'
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic ' + window.btoa(basicAuthToken));
        headers.append('X-Atlassian-Token', "nocheck")

        this.requestOptions = new RequestOptions()
        this.requestOptions.headers = headers


    }

    linkFeature(feature: Feature, tcmId: string, callback: (tcmId: string) => void) {

        console.log("linkFeature called")
    }

    /**
     * Find the requirement item on the test case management tool
     */
    findFeature(tcmid: string): Observable<FeatureTCM> {
        let issueDetailUrl = this.baseApiUrl + '/issue/' + tcmid
        let issuelinksUrl = this.baseApiUrl + '/issue/' + tcmid + '?fields=issuelinks'
        return Observable.forkJoin(
            this.http.get(issueDetailUrl, this.requestOptions).map(this.buildFeatureTCM),
            this.http.get(issuelinksUrl, this.requestOptions).map(this.buildTestCases)
        ).map((data) => {
            let featureTCM = <FeatureTCM>data[0]
            let testCases = <Array<TestCase>>data[1]
            featureTCM.TestCases = testCases
            return featureTCM
        }).catch(RxHTTPErrorHandler.handleError)
    }


    /**
   * Find testcases related to a specific feature on the test test case management tool
   */
    findTestCases(featureTCMId: string): Observable<Array<TestCase>> {
        let issuelinksUrl = this.baseApiUrl + '/issue/' + featureTCMId + '?fields=issuelinks'
        return this.http.get(issuelinksUrl, this.requestOptions).map(this.buildTestCases).catch(RxHTTPErrorHandler.handleError)

    }
    /**
      * Find a specific testcase related to a specific feature on the test test case management tool
      */
    findTestCaseBySummary(featureTCMId: string, testCaseSummary: string): Observable<TestCase> {

        return
    }

    createTestCase(scenario: Scenario, projectId: string, featureTCMId: string, feature: Feature): Observable<TestCase> {
        let issueCreateUrl = this.baseApiUrl + '/issue'
        let issueLinkUrl = this.baseApiUrl + '/issueLink'


        let createRequest = {
            "fields": {
                "project": {
                    "id": this.tcmSettings.ProjectId
                },
                "summary": scenario.getSummary(),
                "issuetype": {
                    "id": this.tcmSettings.TestCaseTypeId
                },

                "description": this.formatJiraDescription(scenario, feature)

            }
        }
        console.log(JSON.stringify(createRequest))

        let linkRequest = {
            "type": {
                "name": this.tcmSettings.TestCaseTypeName
            },
            "inwardIssue": {
                "key": ""
            },
            "outwardIssue": {
                "key": featureTCMId
            }
        }

        let newTestCaseStream: Observable<TestCase> = Observable.create(observer => {
            this.http.post(issueCreateUrl, createRequest, this.requestOptions).subscribe(

                response => {
                    let issueJson: any = response.json()

                    let testCase = new TestCase()
                    testCase.Id = issueJson.key
                    testCase.Summary = scenario.getSummary()
                    testCase.Description = scenario.getDescription()
                    testCase.CreationTime = new Date()
                    testCase.UpdateTime = new Date()

                    linkRequest.inwardIssue.key = issueJson.key

                    console.log(JSON.stringify(linkRequest))

                    this.http.post(issueLinkUrl, linkRequest, this.requestOptions).subscribe(
                        response => {

                            observer.next(testCase);
                            observer.complete();

                        }, error => { })

                },
                error => { })

        })
        return newTestCaseStream
    }


    updateTestCase(scenario: Scenario, testcase: TestCase, feature: Feature): Observable<TestCase> {
        let issueUpdateUrl = this.baseApiUrl + '/issue/' + testcase.Id

        let updateRequest = {
            "fields": {
                "description": this.formatJiraDescription(scenario, feature),
                "summary": scenario.getSummary()
            }
        }

        let newTestCaseStream: Observable<TestCase> = Observable.create(observer => {
            this.http.put(issueUpdateUrl, updateRequest, this.requestOptions).subscribe(
                response => {

                    observer.next(testcase);
                    observer.complete();

                }, error => { })
        })
        return newTestCaseStream
    }

    private formatJiraDescription(scenario: Scenario, feature: Feature): string {
        let template =
            `{{#background}}{color:#770088}Background: {color}: {{{summary}}}
            {{{description}}}
            {{#steps}}{color:#770088}{{keyword}}{color}{{{text}}}
            {{#dataTable}}
            {{#header}} | {color:blue}{{{.}}}{color} {{/header}} {{#header.length}}|{{/header.length}}
            {{#values}}{{#.}}| {color:#FF4500}{{{.}}}{color} {{/.}} |
            {{/values}}{{/dataTable}}
            {{/steps}}{{/background}}

            {{#scenario}}{{#tags}}{color:green}{{{.}}}{color} {{/tags}}
            {color:#770088}{{keyword}}{color}: {{{summary}}}
            {{{description}}}
            {{#steps}}{color:#770088}{{keyword}}{color}{{{text}}}
            {{#dataTable}}
            {{#header}} | {color:blue}{{{.}}}{color} {{/header}} {{#header.length}}|{{/header.length}}
            {{#values}}{{#.}}| {color:#FF4500}{{{.}}}{color} {{/.}} |
            {{/values}}{{/dataTable}}
            {{/steps}}

            {{#examples.length}}
            {color:#770088}Examples:{color}
            {{#examples}}
            {{#header}} | {color:blue}{{{.}}}{color}{{/header}} |
            {{#values}}{{#.}}| {color:#FF4500}{{{.}}}{color} {{/.}} |
            {{/values}}
            {{/examples}}
            {{/examples.length}}
            {{/scenario}}`
        let model = { scenario: scenario, background: feature.getBackground() }
        var rendered = Mustache.render(template, model);
        return rendered
    }

    private buildFeatureTCM(res: Response, that: any): FeatureTCM {
        let body = res.json();

        let featureTCM = new FeatureTCM()
        featureTCM.Id = body.key
        featureTCM.Summary = body.fields.summary
        featureTCM.Description = body.fields.description ? body.fields.description : undefined
        featureTCM.Author = body.fields.assignee ? body.fields.assignee.displayName : undefined
        featureTCM.CreationTime = body.fields.created ? new Date(Date.parse(body.fields.created)) : undefined
        featureTCM.UpdateTime = body.fields.updated ? new Date(Date.parse(body.fields.updated)) : undefined
        featureTCM.Status = body.fields.status.name ? body.fields.status.name : undefined
        featureTCM.Release = body.fields.fixVersions && body.fields.fixVersions.length > 0 ? body.fields.fixVersions[0].name : undefined
        featureTCM.addCustomFied('project', body.fields.project.name)

        return featureTCM
    }

    private buildTestCases(res: Response): Array<TestCase> {
        let body = res.json();
        let testCases: Array<TestCase> = []
        //find 'tested by' issue types
        if (body.fields.issuelinks && body.fields.issuelinks.length > 0) {
            let testCaseIssueLinks = body.fields.issuelinks.filter((value, index, array): boolean => {
                // return value.type.inward === this.tcmSettings.TestCaseRelationshipType
                return value.type.inward === "is tested by"
            })
            if (testCaseIssueLinks && testCaseIssueLinks.length > 0) {
                testCaseIssueLinks.forEach(issuelink => {
                    let inwardLink = issuelink.inwardIssue
                    let testCase = new TestCase()
                    testCase.Id = inwardLink.key
                    testCase.Summary = inwardLink.fields.summary ? inwardLink.fields.summary : undefined
                    testCase.Description = inwardLink.fields.description ? inwardLink.fields.description : undefined
                    testCase.Author = inwardLink.fields.assignee ? inwardLink.fields.assignee.displayName : undefined
                    testCase.CreationTime = inwardLink.fields.created ? new Date(Date.parse(inwardLink.fields.created)) : undefined
                    testCase.UpdateTime = inwardLink.fields.created ? new Date(Date.parse(inwardLink.fields.created)) : undefined
                    testCase.Status = inwardLink.fields.status ? inwardLink.fields.status.name : undefined
                    testCases.push(testCase)
                })
            }
        }


        return testCases
    }

    private merge
}