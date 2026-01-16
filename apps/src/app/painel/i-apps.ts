import { LoadChildrenCallback } from "@angular/router";

export interface IAppsInfo {
    path?: string;
    titulo?: string;
    subTitle?: string;
    description?: string;
    loadChildren?: LoadChildrenCallback;
}