import { Component, HostListener, Input, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
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
    selector: 'px-header-cell',
    template: `<ng-container *ngIf="column">
<div class="row">
@if(!!column.headerName){  <span class="text-content">{{column.headerName}} </span> }
@if(sort === 'ASC'){
    <button mat-icon-button >
        <mat-icon>arrow_upward</mat-icon>
    </button>
}
@else if(sort === 'DESC'){
    <button mat-icon-button >
        <mat-icon>arrow_downward</mat-icon>
    </button>
}
</div> 
</ng-container>`,
    styleUrls: [
        'header-cell.component.scss'
    ]
})
export class HeaderCellRenderer<T> {
    sort?: 'ASC' | 'DESC';
    constructor(
        private readonly vcr: ViewContainerRef,
        private readonly services: DataGridService,
    ) { }
    @Input()
    column?: IColumnOption<T>;

    @HostListener('click')
    clickHandler() {
        if (!this.sort) this.sort = 'ASC';
        else if (this.sort === 'ASC') this.sort = 'DESC';
        else this.sort = undefined;
        if (this.column?.fieldName)
            this.services.setSort(this.column?.fieldName, this.sort);
    }
}