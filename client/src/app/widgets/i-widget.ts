import { Type } from "@angular/core";
import { IControl } from "./i-control";

export interface IWidget {
    title?: string;
    description?: string;
    tags?: string[];
    component?: Type<any>;
    module?: Type<any>;
    settings?: { [control: string]: IControl };
}