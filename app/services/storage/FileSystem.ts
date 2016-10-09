import {Injectable} from '@angular/core'
import * as fs from 'fs'
import * as readline from 'readline'
import * as path from 'path'
import * as minimatch from 'minimatch'

declare var nodeRequire: any
@Injectable()
export class FileSystem {
  private fs: any;
  private path: any;
  private readline: any;

  constructor() {
    this.fs = window['fs'];
    this.path = window['path'];
    this.readline = nodeRequire('readline')
  }

  public isDir(path: string): boolean {
    let stats: fs.Stats;
    stats = this.fs.statSync(path);
    return stats.isDirectory();
  }

  public exists(path): boolean {
    try {
      this.fs.statSync(path)
    } catch (ex) {
      return false
    }
    return true
  }
  public stat(path: string): fs.Stats {
    return this.fs.statSync(path)
  }

  public getFileNameFromPath(filePath: string): string {
    let pathElements: Array<string> = filePath.split(this.fileSeparator());
    return pathElements[pathElements.length - 1];
  }

  public readFile(filePath, encoding): string {
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

  public listFiles(absolutePath: string, matcherPaths: string,dirExcludes : Array<string>): Array<string> {

    var matchers = this.toPatternMatcher(matcherPaths);
    var list: Array<string> = []

    
    var files = this.fs.readdirSync(absolutePath);

    files.forEach((file) => {
     if(dirExcludes && dirExcludes.indexOf(file) > -1)
     return
      var filePath = this.path.join(absolutePath, file)

      let fileStat: fs.Stats = this.fs.statSync(filePath);

      if (fileStat.isDirectory()) {
        let recursiveList: Array<string> = this.listFiles(filePath, matcherPaths,dirExcludes);

        list = list.concat(recursiveList)

      } else {

        
        if (matchers(filePath)) {
          list.push(filePath)
        }

      }
    });
    return list;
  }


  public buildDirTree(filepath: string): FileTreeNode {
    let that = this;
    let tree = {

      // value: filename 
      value: {
        name: filepath,
        setName(name: string): void {
          this.name = name;
        },
        toString(): string {
          return that.getFileNameFromPath(this.name);
        }

      }
    }

    //Recursion stop condition
    if (!this.isDir(filepath))
      return tree


    // It is a directory . Init children
    tree['children'] = []

    let dir: Array<string> = this.fs.readdirSync(filepath);
    dir.forEach(file => {
      let nestedFilepath = filepath + this.fileSeparator() + file
      if (this.isDir(nestedFilepath))
          tree['children'].push(this.buildDirTree(nestedFilepath))
    })

    return tree
  }

  public createFolder(folderPath: string): void {
    try {
      this.fs.mkdirSync(folderPath)
    } catch (ex) {
      throw new Error(`Error while creating folder [${folderPath}]: Nested Exception is [${ex.name}][${ex.message}]`)
    }
  }

  public createFile(filePath: string): void {
    try {
      this.fs.writeFileSync(filePath)
    } catch (ex) {
      throw new Error(`Error while creating file [${filePath}]: Nested Exception is [${ex.name}][${ex.message}]`)
    }
  }

  public writeTextFile(filePath: string, text: string): void {
    try {
      this.fs.writeFileSync(filePath, text)
    } catch (ex) {
      throw new Error(`Error while writing file [${filePath}]: Nested Exception is [${ex.name}][${ex.message}]`)
    }
  }


  private toPatternMatcher(pattern) {
    return function (path) {
      var minimatcher = new minimatch.Minimatch(pattern, { matchBase: true })
      return minimatcher.match(path)
    }
  }



}

export interface FileTreeNode {
  value: string | any
  children?: Array<FileTreeNode>;
}