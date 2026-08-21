import { Injectable } from "@angular/core";
import { DataGridComponent } from "./data-grid.component";

@Injectable()
export class DataGridService {
    private _sort?: any;
    private _grid?: DataGridComponent<any>;
    set grid(value: DataGridComponent<any>) { this._grid = value; }
    setSort(field: string, order?: 'ASC' | 'DESC'
    ) {
        if (!this._sort) this._sort = {};
        if (field in this._sort) {
            if (this._sort[field] === 'ASC')
                this._sort[field] = 'DESC'
            else if (this._sort[field] === 'DESC')
                delete this._sort[field];
        } else {
            this._sort[field] = 'ASC';
        }
        this._grid?.sorted.emit(this._sort);
    }
}