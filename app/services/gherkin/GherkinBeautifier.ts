
import {Injectable} from '@angular/core'

@Injectable()
export class GherkinBeautifier {
    private space: string = " "
    private spaceLevel: number = 1
    private indentSpace: string = this.space.repeat(this.spaceLevel)
    /**
     * Indent gherkin text.
     * 
     */
    public beautifyText(text: string, spaceLevel?: number) {
        /**
         * Internal implementation :
         *  1) Split by lines
         *  2) Trim lines
         *  3) Detect line type (Feature)
         */

        let textLines: Array<string> = text.split("\n")
        let indentedText = ""
        let currentIndent = 0
        let scenarioDetected = false

        textLines.forEach(line => {
            switch (this.checkLine(line)) {
                case LineType.TAGS:
                    if (scenarioDetected) {
                        indentedText = indentedText.concat(this.indentLine(2, line))
                        currentIndent = 2
                    } else {
                        currentIndent = 0
                        indentedText = indentedText.concat(this.indentLine(0, line))
                    }
                     indentedText = indentedText.concat("\n")
                    break;
                case LineType.FEATURE:
                    indentedText = indentedText.concat(this.indentLine(0, line))
                    currentIndent = 0
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.BACKGROUND:
                    indentedText = indentedText.concat(this.indentLine(2, line))
                    currentIndent = 2
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.SCENARIO:
                    indentedText = indentedText.concat(this.indentLine(2, line))
                    indentedText = indentedText.concat("\n")
                    scenarioDetected = true
                    break;
                case LineType.GIVEN:
                    indentedText = indentedText.concat(this.indentLine(4, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.WHEN:
                    indentedText = indentedText.concat(this.indentLine(5, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.THEN:
                    indentedText = indentedText.concat(this.indentLine(5, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.AND:
                    indentedText = indentedText.concat(this.indentLine(6, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.BUT:
                    indentedText = indentedText.concat(this.indentLine(6, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.DATATABLE:
                    indentedText = indentedText.concat(this.indentLine(6, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.EXAMPLES:
                    indentedText = indentedText.concat(this.indentLine(4, line))
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.COMMENT:
                    indentedText = indentedText.concat(line)
                    indentedText = indentedText.concat("\n")
                    break;
                case LineType.DESCRIPTION:
                    if (scenarioDetected) {
                        indentedText = indentedText.concat(this.indentLine(2, line))
                    } else {
                        indentedText = indentedText.concat(this.indentLine(0, line))
                    }
                    indentedText = indentedText.concat("\n")
                    break;
                default:
                    indentedText = indentedText.concat(line)
                    indentedText = indentedText.concat("\n")
                    break;
            }
        })

        return indentedText


    }


    private checkLine(line: string) {

        let trimmedLine = line.trim()

        if (trimmedLine.startsWith("@"))
            return LineType.TAGS

        if (trimmedLine.startsWith("Feature:"))
            return LineType.FEATURE

        if (trimmedLine.startsWith("Background:"))
            return LineType.BACKGROUND

        if (trimmedLine.startsWith("Scenario:") || trimmedLine.startsWith("Scenario Outline:"))
            return LineType.SCENARIO

        if (trimmedLine.startsWith("Given"))
            return LineType.GIVEN

        if (trimmedLine.startsWith("When"))
            return LineType.WHEN

        if (trimmedLine.startsWith("Then"))
            return LineType.THEN

        if (trimmedLine.startsWith("And"))
            return LineType.AND

        if (trimmedLine.startsWith("But"))
            return LineType.BUT

        if (trimmedLine.startsWith("Examples:"))
            return LineType.EXAMPLES

        if (trimmedLine.startsWith("#"))
            return LineType.COMMENT

        if (trimmedLine.startsWith("|"))
            return LineType.DATATABLE

        return LineType.DESCRIPTION

    }

    indentLine(startPosition: number, text: string): string {
        let spacer = this.indentSpace.repeat(startPosition)
        return spacer.concat(text.trim())
    }

}

export enum LineType {
    TAGS,
    FEATURE,
    DESCRIPTION,
    BACKGROUND,
    SCENARIO,
    GIVEN,
    WHEN,
    THEN,
    AND,
    BUT,
    DATATABLE,
    EXAMPLES,
    COMMENT
}