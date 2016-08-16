import {Injectable} from '@angular/core'


@Injectable()
export class Tag {
    private key : string;
    private value : string;

	constructor(key: string, value: string) {
		this.key = key;
		this.value = value;
	}
    

	public getKey(): string {
		return this.key;
	}

	public setKey(value: string) {
		this.key = value;
	}

	public getValue(): string {
		return this.value;
	}

	public setValue(value: string) {
		this.value = value;
	}
    
}