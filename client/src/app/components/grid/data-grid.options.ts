
export interface IColumnOption {
    fieldName?: string;
    headerName?: string;
    format?: string;
    class?: any;
    type?: any;
    template?: any;
    component?: any;
    hide?: boolean;
}

export interface DataGridOptions {
    colums: IColumnOption[];
}