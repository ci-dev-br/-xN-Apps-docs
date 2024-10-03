import { NgModule } from "@angular/core";
import { LoadIconsService } from "./load-icons.service";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { CI_ICON_PACK, IPack } from "./token";

@NgModule({
    imports: [
        CommonModule,
        MatIconModule,
    ],
    providers: [
        LoadIconsService,
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
    LoadIconsService,
    IPack,
    CI_ICON_PACK,   
}