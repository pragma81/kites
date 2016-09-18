import { Directive, ElementRef, EventEmitter, Component, ViewChild, Input, Output, AfterContentInit} from '@angular/core';

var ace = require('brace');
require('brace/mode/gherkin');
require('brace/theme/clouds');
require('brace/theme/monokai');
require('brace/ext/language_tools');
require('brace/ext/spellcheck');



/*
@Component({
    selector: 'editor',
    template: `
    <div #aceeditor style="display:block; height: 80vh; width:100%"></div>
    `
}) */
@Directive({
    selector: '[ace-editor]',
    exportAs: 'gherkineditor',
    inputs: ['text', 'mode', 'theme', 'readOnly', 'options'],
    outputs: ['textChanged', 'editorRef']
})
export class Editor implements AfterContentInit{
    static get parameters() {
    return [[ElementRef]];
  }
    /*@ViewChild("aceeditor") divRef: ElementRef
     @Input() mode
     @Input() theme
     @Input() readOnly
     @Input() options
     @Input() text
    
    @Output() textChanged = new EventEmitter();  
*/
    private editor: any 

     private _mode :any
     private _theme : any
     private _readOnly :any
     private textChanged :any
     private editorRef : any
     private oldVal: string


    constructor(elementRef) {
        this.textChanged = new EventEmitter();
        this.editorRef = new EventEmitter();

        const el = elementRef.nativeElement;
        el.classList.add('editor');

        this.editor = ace.edit(el);

        setTimeout(() => {
            this.editorRef.next(this.editor);
        });

        this.editor.on('change', () => {
            const newVal = this.editor.getValue();
            if (newVal === this.oldVal) return;
            if (typeof this.oldVal !== 'undefined') {
                this.textChanged.next(newVal);
            }
            this.oldVal = newVal;
        });

        this.editor.setShowPrintMargin(false);

    }

    
    ngAfterContentInit() {
        this.editor.focus();
        this.editor.gotoLine(1)
    }

    
    public ChangeOptions(value) {
        this.editor.setOptions(value || {});
    }

    public ChangeReadOnly(value) {
        this.readOnly = value;
        this.editor.setReadOnly(value);
    }

    public ChangeTheme(value) {
        this.theme = value;
        this.editor.setTheme(`ace/theme/${value}`);
    }

    public ChangeMode(value) {
        this.mode = value;
        this.editor.getSession().setMode(`ace/mode/${value}`);
    }

    public ChangeText(value) {
        if (value === this.oldVal) return;
        this.editor.setValue(value);
        this.editor.clearSelection();
        this.editor.focus();
    }

    public addAnnotations(annotations: Array<Annotation>) {
        this.clearAnnotations()
        this.editor.getSession().setAnnotations(annotations)
    }

     public clearAnnotations() {
        this.editor.getSession().clearAnnotations()
    }

    set options(value) {
        this.editor.setOptions(value || {});
    }

    set readOnly(value) {
        this._readOnly = value;
        this.editor.setReadOnly(value);
    }

    set theme(value) {
        this._theme = value;
        this.editor.setTheme(`ace/theme/${value}`);
    }

    set mode(value) {
        this._mode = value;
        this.editor.getSession().setMode(`ace/mode/${value}`);
    }

    set text(value) {
        if (value === this.oldVal) return;
        this.editor.setValue(value);
        this.editor.clearSelection();
        this.editor.focus();
    }

  public addkeyBinding(keyBinding:KeyBinding):void {
      this.editor.commands.addCommand(keyBinding)
}


}

export interface Annotation {
    row: number
    column: number
    text: string
    type: string
}

export interface KeyBinding {
    name:string
    bindKey: BindKey
    exec: (editor)=> void
    readOnly?:boolean
}

export interface BindKey {
    win?:string
    mac?:string
}