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
    constructor(
        private readonly vcr: ViewContainerRef,
        private readonly services: DataGridService,
    ) { }
    @Input()
    data?: any;
    @Input()
    column?: IColumnOption<T>;
    componentContent?: any[][];
    get value() {
        if (this.column?.fieldName && this.data)
            return this.data[this.column?.fieldName]
    }
}