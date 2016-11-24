import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'MsToDate'
})
export class MsToDate implements PipeTransform {
  transform(milliseconds: number): string {
    if (!milliseconds) return ""

    let date : Date = new Date (milliseconds)
    
    return date.toLocaleString()
  }
}