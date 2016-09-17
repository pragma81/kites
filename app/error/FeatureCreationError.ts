import {ErrorWithDetails} from './ErrorWithDetails';
import {ErrorDetail} from './ErrorDetail';
import {BaseError} from './BaseError';
export class FeatureCreationError extends ErrorWithDetails {
    private row : number
    private column : number
    
    constructor(message: string, error:Error,detail:ErrorDetail){
        super(message, error,detail)
        this.name = 'FeatureCreationError'

    }

    get Column():number{
        return this.column
    }

    set Column(value:number){
        this.column = value
    }

     get Row():number{
        return this.row
    }

    set Row(value:number){
        this.row = value
    }

}