import { Component, Input } from "@angular/core";
import { DataGridOptions, IColumnOption } from "./data-grid.options";


@Component({
    selector: 'ci-data-grid',
    templateUrl: 'data-grid.component.html',
    styleUrls: ['data-grid.component.scss'],
})
export class DataGridComponent<I> {
    @Input()
    selectionMode?: 'cell' | 'row' | 'multi-cell' | 'multi-row' | 'multi' = 'row';
    @Input()
    source?: I[];
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
}