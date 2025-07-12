import { Type } from "@angular/core";
import { Route } from "@angular/router";
import { MasterDetailComponent } from "@ci/components";

export function RouteFromSchema(c: string, componentBase: Type<any> = MasterDetailComponent;) {
    return {
        path: `${c}`, component: componentBase, data: {
            schema: `${c}`, title: `${c}`, icon: `svg:${c}`,
        }
    } as Route
}