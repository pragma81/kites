export class Scenario {
    private summary : string;
    private description : string;
    private level : TestLevel
    private trackId : string;
    private rawData : string ;
}

export enum TestLevel{
    smoke,
    basic,
    acceptance
}