
export interface IColumnOption {
    fieldName?: string;
    headerName?: string;
    format?: string;
    class?: any;
    type?: any;
    template?: any;
    component?: any;
    hide?: boolean;
    defaultVisible?: boolean;
}
export type DataTypes = 'text' | 'number' | 'decimal' | 'currency' | 'boolean';
export interface DataGridOptions {
    colums: IColumnOption[];

}
export interface IPivot<T> {
    fieldName: string;
    occurrence?: 'equal' | 'ilike';
    compareFunction?: (a: T, b: T) => boolean;
}
export interface ILoadListOptions<T> {
    position?: number;
    size?: number;
    filter?: { [P in keyof T]?: ['max' | 'min' | 'equal' | 'diff', any] };
    loadData?: { [P in keyof T]?: boolean };
}