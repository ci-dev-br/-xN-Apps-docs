import { IColumnOption } from "./i-column-options";
import { ILoadListOptions } from "./i-load-list-options";
import { IPivot } from "./i-pivot";

export interface IDataGridOptions<T> {
    columns: IColumnOption<T>[];
    group?: IPivot<T>;
    loadList?: (options: ILoadListOptions<T>) => T[] | Promise<T[]>;
}