import { InjectionToken } from "@angular/core";

export interface IPack {
    [name: string]: { url: string }
}
/* export interface IConfig {
    pack?: { [name: string]: { url: string } },
} */
export const CI_ICON_PACK = new InjectionToken<IPack>('X_CI_ICON_PACK');