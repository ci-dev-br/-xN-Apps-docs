import { Component, ElementRef, Input, signal, ViewChild, ViewContainerRef } from "@angular/core";
import { DataGridService } from "../data-grid.service";
import { IColumnOption } from "../models/i-column-options";
@Component({
    selector: 'px-cell-renderer',
    template: `
    <div #inner class="inner" [tabIndex]="indc">
        <ng-container *ngIf="column && !column.component">
            <span class="of" [style.text-align]="align()" style="display: block;"  >
                {{value | valueOf}}
            </span>
        </ng-container>
        <ng-container *ngIf="column && !!column.component">
            <ng-container *ngComponentOutlet="column.component; content: componentContent">
                </ng-container>
            </ng-container>
        </div>
    `,
    styleUrls: [
        'cell-renderer.component.scss'
    ],
    standalone: false
})
export class TextCellRenderer<T> {
    static cnt = 0;
    protected indc = ++TextCellRenderer.cnt;
    @ViewChild('inner')
    protected inner?: ElementRef<HTMLDivElement>;
    protected align = signal('left');
    private _column?: IColumnOption<T> | undefined;
    public get column(): IColumnOption<T> | undefined {
        return this._column;
    }
    @Input()
    public set column(value: IColumnOption<T> | undefined) {
        if (this._column === value) return;
        this._column = value;
        if (this.data && this.column && this.column.component)
            this.componentContent = [[document.createTextNode(this.value)]];
        if (value) {
            this.align.set('right');
        }
    }
    private _data?: any;
    public get data(): any {
        return this._data;
    }
    @Input()
    public set data(value: any) {
        if (this._data === value) return;
        this._data = value;
        if (this.data && this.column && this.column.component)
            this.componentContent = [[document.createTextNode(this.value)]];
    }
    componentContent?: any[][];
    private _value: any;
    get value() {
        if (this._value !== undefined) return this._value;
        // TODO: implementar camada de aplicação de valor
        if (this.column?.fieldName && this.data) {
            let inner = this.data;
            return this._value = this.data[this.column?.fieldName]
        }
    }
    constructor(
        private readonly vcr: ViewContainerRef,
        private readonly services: DataGridService,
    ) { }
}