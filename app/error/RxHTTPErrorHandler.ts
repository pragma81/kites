import {Injectable} from '@angular/core'
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/observable/throw';

declare var nodeRequire: any

@Injectable()
export class RxHTTPErrorHandler  {
  
     static  handleError (error: any) {
    
    //Resource not found will be managed by the application specific code
    if(error.status === 404)
      return Observable.throw(error);

   
    let errorIconPath =  nodeRequire('electron').remote.process.resourcesPath+'/assets/error-http-icon-64.png'

    let errorIcon = nodeRequire('electron').remote.nativeImage.createFromPath(errorIconPath)

    let errorDetail = RxHTTPErrorHandler.buildMessageDetail(error)
    nodeRequire('electron').remote.dialog.showMessageBox({
      type: "error",
      buttons: ["Close"],
      title: errorDetail.title,
      message: errorDetail.message,
      detail: errorDetail.detail,
      icon : errorIcon
    })
    return Observable.throw(error);
    
  }

  static buildMessageDetail(error:any) : any {
    let errordetail = { title : "Connection Error", message : " Error during server connection", detail :`${error.status} - ${error.statusText}. `}
    
    switch(error.status){
      case 401: //Unauthorized
      case 403: //Forbidded
                errordetail.detail = errordetail.detail + "Please verify username and password in your kites.properties configuration file"
                break
      case 408: //Request Timeout
      case 500: //Internal Server Error
                errordetail.detail = errordetail.detail + "Please contact your test case management tool administrator."
                break
      case 400: //Bad Request . List Error from server
                let badRequestData = JSON.parse(error._body)
                errordetail.detail = "Errors from server: ["+badRequestData.errors.issuetype+"]. Please verify test case management properties (tcm) in your kites.properties configuration file."
                break
      default: //Other generic error. No hint avaiable
               errordetail.detail = "Unknown Error. Please verify that your internet connection is available. If you are using a proxy or VPN please verify that they are properly configured."
                break
      }

      return errordetail
    }
}