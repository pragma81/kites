import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'da-metrics-tile',
  template: `
  
    <a class="tile-metric" (click)="onLegendClick($event)">
                <div class="tile-metric-inner">
                    <div class="tile-metric-image">
                    </div>
                    <div class="tile-metric-content">
                        <span class="tile-metric-data">
              {{value}}
            </span>
                        <div class="tile-metric-data-legend">
                            {{legend}}
                        </div>
                    </div>
                </div>
            </a>
            
  `
})
export class MetricsTile {
@Input() value = 0;
@Input() legend = "";
@Output() legendClickEmitter = new EventEmitter();

onLegendClick(event ){
  this.legendClickEmitter.emit({
      value: this.value,
      legend: this.legend
    })
}

}