
import { ErrorDetail, Severity } from './ErrorDetail';
import { ExceptionHandler, Injector, Injectable } from 'angular2/core';
import { ToastController } from 'ionic-angular';
import { ErrorWithDetails } from './ErrorWithDetails';


declare var nodeRequire: any
class _ArrayLogger {
  res = [];
  log(s: any): void { this.res.push(s); }
  logError(s: any): void { this.res.push(s); }
  logGroup(s: any): void { this.res.push(s); }
  logGroupEnd() {
    this.res.forEach(error => {
      console.error(error);
    })
  };
}

@Injectable()
export class GlobalExceptionHandler extends ExceptionHandler {


  constructor(private toastController: ToastController) {
    super(new _ArrayLogger(), false);
  }

  call(error, stackTrace = null, reason = null) {
    super.call(error, stackTrace, reason);
    let message: string = ""

    if (error instanceof ErrorWithDetails) {
      message = (<ErrorWithDetails>error).getDetail().getSummary()
      message = message.concat("[Hint] - ").concat((<ErrorWithDetails>error).getDetail().getResolutionHint())
    } else {
      message = message.concat("[Generic Error] - ").concat(error.message)
    }
   
let errorIconPath =  nodeRequire('electron').remote.process.resourcesPath+'/assets/error-icon-64.png'

let errorIcon = nodeRequire('electron').remote.nativeImage.createFromPath(errorIconPath)

    nodeRequire('electron').remote.dialog.showMessageBox({
      type: "error",
      buttons: ["Close"],
      title: "Oops Something went wrong",
      message: "Oops!! Something went wrong - Generic Error",
      detail: message,
      icon : errorIcon
    })
  }
}