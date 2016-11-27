import {Injectable} from '@angular/core';


@Injectable()
export class FileInfo {

    constructor(private filename: string,
        private fileAbsolutePath: string,
        private creationTime: number,
        private updateTime: number) { }

    public getFilename(): string {
        return this.filename
    }

    public getFileAbsolutePath(): string {
        return this.fileAbsolutePath
    }

    public getCreationTime(): number {
        return this.creationTime;
    }
    public getUpdateTime():number {
        return this.updateTime;
    }
}