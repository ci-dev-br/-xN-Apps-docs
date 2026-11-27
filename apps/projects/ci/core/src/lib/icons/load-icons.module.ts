import { NgModule } from "@angular/core";
import { IconLoaderSerices } from "./icon-loader.service";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { CI_ICON_PACK, IPack, IPackEntry } from "./token";

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
    ],
    providers: [
        IconLoaderSerices,
    ],
    declarations: [],
    exports: [],
})
export class LoadIconsModule {
    /* static forFeature(options: IConfig): ModuleWithProviders<LoadIconsModule> {
        return {
            ngModule: LoadIconsModule,
            providers: [
                { provide: CI_ICON_PACK, useValue: options.pack },
            ]
        }
    } */
}
export {
    IconLoaderSerices,
    IconLoaderSerices as LoadIconsService, // TODO: remover uso depreciado
    IPack,
    IPackEntry,
    CI_ICON_PACK,
}