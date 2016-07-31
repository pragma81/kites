import {Component, Input, Output, EventEmitter,Injectable} from '@angular/core';


/* without injectable metadata will no be generated resulting in 
DI exception 'can't resolve all parametrs for Tile(?)'
*/

@Injectable()
export class Tile{
    public value = 0;
    public legend = "";
    constructor (value:number, legend:string){
        this.value = value;
        this.legend = legend;
    }

}

@Component({
  selector: 'da-tiles',
  template: `
   <div class="tiles-metric" (click)="onTilesClick($event)">
    
    <a *ngFor="let tile of tiles" class="tile-metric" >
                <div class="tile-metric-inner">
                    <div class="tile-metric-image">
                    </div>
                    <div class="tile-metric-content">
                        <span class="tile-metric-data">
              {{tile.value}}
            </span>
                        <div class="tile-metric-data-legend">
                            {{tile.legend}}
                        </div>
                    </div>
                </div>
            </a>
    </div>
              
  `
})
export class Tiles {

@Input() tiles ;
@Output() tilesClickEmitter = new EventEmitter();

onTilesClick(event ){
  this.tilesClickEmitter.emit({
      tiles: this.tiles
    })
}

}