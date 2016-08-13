import {Feature} from '../../models/Feature'


export interface FeatureService {
    getAll(): Array<Feature>;
    findByQuery(queryOptions : Object): Array<Feature>;
    findById(id:String):Feature;
    refresh();
    save(feature: Feature):Feature;
}
