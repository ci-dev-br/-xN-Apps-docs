import { IListFieldOptions } from "./i-list-field-options";
import { ILoadListOptions } from "./i-load-list-options";
import { IPivot } from "./i-pivot";

export interface IListOptions<T> {
    dataFields?: IListFieldOptions<T>[],
    group: IPivot<T>;
    loadList: (options: ILoadListOptions<T>) => T[] | Promise<T[]>;
}
