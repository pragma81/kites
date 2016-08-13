import {ErrorDetail} from './ErrorDetail';
import {BaseError} from './BaseError';
export class ErrorWithDetails extends Error {
    protected detail : ErrorDetail;

    constructor(message: string, error:Error,detail:ErrorDetail){
        super(message)
        //super(message, error)
        this.detail = detail
        this.name = 'ErrorWithDetails'

    }
    
    public getDetail(){
        return this.detail
    }

}