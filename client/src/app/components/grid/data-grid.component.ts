import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DataGridOptions, IColumnOption } from "./data-grid.options";
import { ReturnStatement } from "@angular/compiler";


@Component({
    selector: 'ci-data-grid',
    templateUrl: 'data-grid.component.html',
    styleUrls: ['data-grid.component.scss'],
})
export class DataGridComponent<I> {
    @Output()
    select = new EventEmitter<I | I[]>();
    @Input()
    selectionMode?: 'cell' | 'row' | 'multi-cell' | 'multi-row' | 'multi' = 'row';
    @Input()
    source?: I[];

    selectedItem?: I;
    selectedItems?: I[];

    private _options?: DataGridOptions | undefined;
    public get options(): DataGridOptions | undefined {
        return this._options;
    }
    @Input()
    public set options(value: DataGridOptions | undefined) {
        if (this._options === value) return;
        this._options = value;
        this.columns = this._options?.colums;
        this.displayedColumns = this.columns?.filter(c => !c.hide && c.defaultVisible !== false)?.map((c, i) => c.fieldName || '')
    }
    columns?: IColumnOption[];
    displayedColumns?: string[];
    constructor() { }

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