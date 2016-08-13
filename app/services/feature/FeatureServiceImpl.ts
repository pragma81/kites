
import {Injectable} from '@angular/core'
import {Feature} from '../../models/Feature'
import {FeatureService} from './FeatureService'

import {FeatureRepository} from '../../repository/FeatureRepository'


@Injectable()
export class FeatureServiceImpl implements FeatureService {
    private featureRepository :FeatureRepository
    constructor($featureRepository : FeatureRepository){
        this.featureRepository = $featureRepository;
    }
    public getAll(): Array<Feature>{return}
    findByQuery(queryOptions : Object): Array<Feature>{ return}
    findById(id:String):Feature{return}
    refresh(){}
    save(feature: Feature):Feature{
        this.featureRepository.save(feature);
         console.log('Feature [' + feature.getId() + ',' + feature.getFileName() + '] saved ');
         return feature
        }
}