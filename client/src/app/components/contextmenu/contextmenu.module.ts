import { ModuleWithProviders, NgModule } from "@angular/core";
import { ContextmenuDirective } from "./contextmenu.directive";
import { ContextmenuService } from "./contextmenu.service";

@NgModule({
    imports: [],
    declarations: [
        ContextmenuDirective,
    ],
    exports: [
        ContextmenuDirective,
    ],
    providers: [],
})
export class ContextmenuModule {
    static forRoot(): ModuleWithProviders<ContextmenuModule> {
        return {
            ngModule: ContextmenuModule,
            providers: [
                ContextmenuService,
            ]
        }
    }
}