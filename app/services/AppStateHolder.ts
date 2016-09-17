import {Injectable} from '@angular/core';
import {Feature} from '../models/Feature';
import {TestSuite} from '../models/TestSuite';




@Injectable()
export class AppStateHolder {
  private _currentTestSuite : TestSuite
  private _currentFeature : Feature

  get currentTestSuite (): TestSuite{
    return this._currentTestSuite
  }

  set currentTestSuite(value : TestSuite){
    this._currentTestSuite = value
  }

   get currentFeature(): Feature{
    return this._currentFeature
  }

  set currentFeature(value : Feature){
    this._currentFeature = value
  }

}