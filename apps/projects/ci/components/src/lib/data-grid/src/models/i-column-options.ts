import { PipeTransform, Type } from "@angular/core";
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
    pipe?: Type<PipeTransform>;
    defaultVisible?: boolean;
    contextmenu?: IContextMenuOf<T>[];
    schemaProperty?: ISchemaProperty;
}