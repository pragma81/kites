export class ErrorDetail {
    private summary: string;
    private description: string;
    private resolutionHint: string;
    private errorSeverity: Severity;

 constructor(summary:string,description:string,severity:Severity){
	 this.summary = summary
	 this.description = description
	 this.errorSeverity = severity
 }

	public getSummary(): string {
		return this.summary;
	}

	public setSummary(value: string) {
		this.summary = value;
	}

	public getDescription(): string {
		return this.description;
	}

	public setDescription(value: string) {
		this.description = value;
	}

	public getResolutionHint(): string {
		return this.resolutionHint;
	}

	public setResolutionHint(value: string) {
		this.resolutionHint = value;
	}

	public getErrorSeverity(): Severity {
		return this.errorSeverity;
	}

	public setErrorSeverity(value: Severity) {
		this.errorSeverity = value;
	}

}

export enum Severity {
    blocker,
    major,
    minor
}