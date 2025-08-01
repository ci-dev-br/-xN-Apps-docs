import { Type } from "@angular/core";
import { Route } from "@angular/router";
import { MasterDetailComponent } from "@ci/components";

export const RouteFromSchema = (c: string, componentBase: Type<any> = MasterDetailComponent) => {
    return {
        path: `${c}`, component: MasterDetailComponent, data: {
            schema: `${c}`, title: `${c}`, icon: `svg:${c}`,
        }
    } as Route
}