import { IContextMenuOf } from "@ci/components/context-menu";
import { ILoadListOptions } from "./i-load-list-options";
import { IPivot } from "./i-pivot";
import { IColumnOption } from "./i-column-options";

export interface IDataGridOptions<T> {
    columns: IColumnOption<T>[];
    group?: IPivot<T>;
    loadList?: (options: ILoadListOptions<T>) => T[] | Promise<T[]>;
    contextmenu?: IContextMenuOf<T>[];
}