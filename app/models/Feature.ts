export class Feature {
    private name : string;
    private description : string;
    private auto : boolean;
    private process : string;
    private trackId : string;
    private type : TestType;
    private fileName : string;
    private fileAbsolutePath : string;
    private rawData : string;
    private wellFormed : boolean;

    constructor(name : string){
        this.name = name;
    }
}

export enum TestType {
    API,
    UI
}