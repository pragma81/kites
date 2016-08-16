import {Injectable} from '@angular/core'
import * as fs from 'fs'
import * as path from 'path'
import * as minimatch from 'minimatch'

@Injectable()
export class FileSystem {
  private fs: any;
  private path: any;

  constructor() {
    this.fs = window['fs'];
    this.path = window['path'];
  }

  public isDir(path: string) : boolean{
    let stats: fs.Stats;
    stats = this.fs.statSync(path);
    return stats.isDirectory();
  }

  public stat(path : string) : fs.Stats{
    return this.fs.statSync(path)
  }
  public readFile(filePath, encoding) {
    let fileData;
    try {
      fileData = this.fs.readFileSync(filePath, encoding);
    } catch (e) {
      throw new Error("Unable to read path [" + filePath + "]: Nested Exception is [" + e.name + "][" + e.message + "]")
    }
    return fileData;
  }

  public fileSeparator(): string {
    return this.path.sep;
  }

  public listFiles(absolutePath: string, matcherPaths: string): Array<string> {

    var matchers = this.toPatternMatcher(matcherPaths);
    var list: Array<string> = []
    var files = this.fs.readdirSync(absolutePath);

    files.forEach((file) => {
      var filePath = this.path.join(absolutePath, file)

      let fileStat: fs.Stats = this.fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        let recursiveList: Array<string> = this.listFiles(filePath, matcherPaths);

        list = list.concat(recursiveList)

      } else {

        if (matchers(filePath)) {
          list.push(filePath)
        }

      }
    });
    return list;
  }

  private toPatternMatcher(pattern) {
    return function (path) {
      var minimatcher = new minimatch.Minimatch(pattern, { matchBase: true })
      return minimatcher.match(path)
    }
  }
}
