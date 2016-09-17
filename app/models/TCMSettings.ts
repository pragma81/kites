import {Injectable} from '@angular/core';

declare var nodeRequire :any
@Injectable()
export class TCMSettings {
	private type : string = "Jira" 
    private protocol : string = "http"
	private url: string = "factory-docker.au-sdc.com:8080"
    private username : string = "dantelmo"
    private password : string = "changeme1"
   	//General
    private tagKeyword : string = "jiraid"
	private tcmName : string = "Jira"
	private projectkey : string = "RXRN"
	private projectId : string = "10003"
	
	//Feature
	private featureTestCaseRelationshipType : string = "is tested by"
	private featureType : string = "Story"
	
	//TestCase
	private testCaseTypeId = "10103"
	private testCaseTypeName = "Test"
	private testCaseFeatureRelationshipType : string = "tests"

	 properties :any
 constructor(){
	 var config = nodeRequire('electron').remote.getGlobal('sharedObject').config
	 this.protocol = config.get('tcm.jira.protocol')
	 this.url = config.get('tcm.jira.url')
	 this.username = config.get('tcm.jira.username')
	 this.password = config.get('tcm.jira.password')
	 this.tagKeyword = config.get('tcm.jira.tagkeyword')
	 this.tcmName = config.get('tcm.name')
	 this.ProjectId = config.get('tcm.jira.projectid')
	 this.projectkey = config.get('tcm.jira.projectkey')
	 this.featureTestCaseRelationshipType = config.get('tcm.jira.featureTestcaseRelationshipType')
	 this.testCaseFeatureRelationshipType = config.get('tcm.jira.testcaseFeatureRelationshipType')
	 this.testCaseTypeId = config.get('tcm.jira.testcaseTypeid')
	 this.testCaseTypeName = config.get('tcm.jira.testcaseName')
	 this.featureType = config.get('tcm.featuretype')

	/* var properties = nodeRequire('electron').ipcRenderer.on('config', config => {
this.properties = config});*/
 }
	public get Url(): string  {
		return this.url;
	}

	public set Url(value: string ) {
		this.url = value;
	}
   

	public get Protocol(): string  {
		return this.protocol;
	}

	public set Protocol(value: string ) {
		this.protocol = value;
	}

	public get Username(): string  {
		return this.username;
	}

	public set Username(value: string ) {
		this.username = value;
	}
   

	public get Password(): string  {
		return this.password;
	}

	public set Password(value: string ) {
		this.password = value;
	}
   

	public get TagKeyword(): string  {
		return this.tagKeyword;
	}

	public set TagKeyword(value: string ) {
		this.tagKeyword = value;
	}
   
   public get TcmName(): string  {
		return this.tcmName;
	}

	public set TcmName(value: string ) {
		this.tcmName = value;
	}

	public get ProjectId(): string  {
		return this.projectId;
	}

	public set ProjectId(value: string ) {
		this.projectId = value;
	}
	
	 public get TestCaseTypeName(): string  {
		return this.testCaseTypeName;
	}

	public set TestCaseTypeName(value: string ) {
		this.testCaseTypeName = value;
	}

	 public get TestCaseTypeId(): string  {
		return this.testCaseTypeId;
	}

	public set TestCaseTypeId(value: string ) {
		this.testCaseTypeId = value;
	}


	public get FeatureTestCaseRelationshipType(): string  {
		return this.featureTestCaseRelationshipType;
	}

	public set FeatureTestCaseRelationshipType(value: string ) {
		this.featureTestCaseRelationshipType = value;
	}

	public get TestCaseFeatureRelationshipType(): string  {
		return this.testCaseFeatureRelationshipType;
	}

	public set TestCaseFeatureRelationshipType(value: string ) {
		this.testCaseFeatureRelationshipType = value;
	}


}