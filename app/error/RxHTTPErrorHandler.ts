import {Injectable} from '@angular/core'
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/observable/throw';


@Injectable()
export class RxHTTPErrorHandler  {
  
     static  handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead 
    return Observable.throw(errMsg);
  }

}