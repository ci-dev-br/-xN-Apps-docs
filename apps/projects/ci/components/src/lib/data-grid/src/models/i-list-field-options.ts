import { DataTypes } from "./i-date-types";

export interface IListFieldOptions<T> {
    fieldName: string;
    headerName?: string;
    type?: DataTypes;
}
