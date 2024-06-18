import { Component, Input, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { DataGridService } from "../data-grid.service";
import { IColumnOption } from "../../models/i-column-options";

/*export interface IColumns {
    headerName: string;
    propertyName: string;
    rendererType?: string;
    component?: any;
    componentType?: Type<any>
    hide?: boolean;
}*/
@Component({
    selector: 'px-cell-renderer',
    template: `
    <ng-container *ngIf="column && !column?.component">
       {{value}}
    </ng-container>
    <ng-container *ngIf="column && !!column?.component">
        <ng-template #teste>
            {{value}}
        </ng-template>
        <ng-container *ngComponentOutlet="column.component; content: componentContent">
        </ng-container>
    </ng-container>
    `,
    styleUrls: [
        'cell-renderer.component.scss'
    ]
})
export class TextCellRenderer<T> {
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
    get value() {
        if (this.column?.fieldName && this.data)
            return this.data[this.column?.fieldName]
    }
    constructor(
        private readonly vcr: ViewContainerRef,
        private readonly services: DataGridService,
    ) { }
}