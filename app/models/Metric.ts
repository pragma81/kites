export class Metric {

    private value : string;
    private legend : string;

	constructor(value: string, legend: string) {
		this.value = value;
		this.legend = legend;
	}
    

	public getValue(): string {
		return this.value;
	}

	public setValue(value: string) {
		this.value = value;
	}

	public getLegend(): string {
		return this.legend;
	}

	public setLegend(value: string) {
		this.legend = value;
	}
    
}