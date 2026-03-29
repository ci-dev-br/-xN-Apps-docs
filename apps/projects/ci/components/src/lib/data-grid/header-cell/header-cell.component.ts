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
    templateUrl: 'header-cell.component.html',
    styleUrls: [
        'header-cell.component.scss'
    ],
    standalone: false
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