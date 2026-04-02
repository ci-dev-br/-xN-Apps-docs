import { IContextMenu, IContextMenuOf } from "@ci/components/context-menu";
import { ISchemaProperty } from "@ci/core";

export interface IColumnOption<T> {
    fieldName?: string;
    headerName?: string;
    format?: string;
    class?: any;
    type?: any;
    template?: any;
    component?: any;
    hide?: boolean;
    defaultVisible?: boolean;
    contextmenu?: IContextMenuOf<T>[];
    schemaProperty?: ISchemaProperty;
}