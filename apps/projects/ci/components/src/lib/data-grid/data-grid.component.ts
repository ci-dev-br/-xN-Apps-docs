import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ReturnStatement } from "@angular/compiler";
import { DataGridService } from "./data-grid.service";
import { DataGridOptions } from "../models/i-data-grid-options";
import { IColumnOption } from "../models/i-column-options";


@Component({
    selector: 'ci-data-grid',
    templateUrl: 'data-grid.component.html',
    styleUrls: ['data-grid.component.scss'],
    providers: [DataGridService]
})
export class DataGridComponent<I> {
    @Output()
    sorted = new EventEmitter<any>();
    @Output()
    select = new EventEmitter<I | I[]>();
    @Input()
    selectionMode?: 'cell' | 'row' | 'multi-cell' | 'multi-row' | 'multi' = 'row';
    @Input()
    source?: I[];

    selectedItem?: I;
    selectedItems?: I[];

    private _options?: DataGridOptions<I> | undefined;
    public get options(): DataGridOptions<I> | undefined {
        return this._options;
    }
    @Input()
    public set options(value: DataGridOptions<I> | undefined) {
        if (this._options === value) return;
        this._options = value;
        this.columns = this._options?.colums;
        this.displayedColumns = this.columns?.filter(c => !c.hide && c.defaultVisible !== false)?.map((c, i) => c.fieldName || '')
    }
    columns?: IColumnOption<I>[];
    displayedColumns?: string[];
    constructor(
        services: DataGridService,
    ) {
        services.grid = this;
    }

    rowSelectionHandler(event: MouseEvent, row: I) {
        if (this.selectionMode === 'row') {
            if (event.ctrlKey) {
                if (row === this.selectedItem) {
                    this.select.emit(undefined);
                    this.selectedItem = undefined;
                    return;
                }
            }
            this.select.emit(row);
            this.selectedItem = row;
        }
    }
}