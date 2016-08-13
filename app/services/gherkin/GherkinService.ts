import {Injectable} from '@angular/core'
import {FileSystem} from '../storage/FileSystem'

//No typings available for Gherkin. Gherkin parser will be provided at runtime.
declare var Gherkin: any;

@Injectable()
export class GherkinService {
    private fileSystem: FileSystem;
    constructor(fileSystem: FileSystem) {
        this.fileSystem = fileSystem;
    }

    /* Return the Javascript Objec representing the feature file AST
    */
   public parse(gherkinFile: string): Object {
        let featureFileData = this.fileSystem.readFile(gherkinFile, 'utf-8');
        var parser = new Gherkin.Parser();
        parser.stopAtFirstError = false;
        return parser.parse(featureFileData);

    }


}