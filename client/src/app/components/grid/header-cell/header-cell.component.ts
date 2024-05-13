import { Component, Input, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { IColumnOption } from "../data-grid.options";

/*export interface IColumns {
    headerName: string;
    propertyName: string;
    rendererType?: string;
    component?: any;
    componentType?: Type<any>
    hide?: boolean;
}*/
@Component({
    selector: 'px-header-cell',
    template: `
    <ng-container *ngIf="column">
       {{column?.headerName || ''}}
    </ng-container>
    `,
    styleUrls: [
        'header-cell.component.scss'
    ]
})
export class HeaderCellRenderer {
    constructor(
        private readonly vcr: ViewContainerRef,
    ) { }
    @Input()
    column?: IColumnOption;
}