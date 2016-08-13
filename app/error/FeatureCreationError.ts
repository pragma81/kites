import {ErrorWithDetails} from './ErrorWithDetails';
import {ErrorDetail} from './ErrorDetail';
import {BaseError} from './BaseError';
export class FeatureCreationError extends ErrorWithDetails {

    constructor(message: string, error:Error,detail:ErrorDetail){
        super(message, error,detail)
        this.name = 'FeatureCreationError'

    }
    
}