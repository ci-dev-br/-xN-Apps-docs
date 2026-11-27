import { InjectionToken } from "@angular/core";

export interface IPackEntry {
    url?: string;
    svgContent?: string;
    packCode?: string;
    linkedApps?: string[];
    linkedActions?: string[];
}

export interface IPack {
    [name: string]: IPackEntry;
}

export const CI_ICON_PACK = new InjectionToken<IPack>('X_CI_ICON_PACK');
