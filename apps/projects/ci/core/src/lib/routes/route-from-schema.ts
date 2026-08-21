import { Type } from "@angular/core";
import { Route } from "@angular/router";

export const RouteFromSchema = (c: string, componentBase: Type<any>) => {
    return {
        path: `${c}`, component: componentBase, data: {
            schema: `${c}`, title: `${c}`, icon: `svg:${c}`,
        }
    } as Route
}