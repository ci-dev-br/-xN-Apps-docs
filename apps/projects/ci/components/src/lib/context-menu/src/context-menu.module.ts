import { NgModule } from "@angular/core";
import { ContextMenuDirective } from "./context-menu.directive";
import { CoreModule } from "@ci/core";

@NgModule({
    imports: [
        CoreModule,
    ],
    declarations: [
        ContextMenuDirective,
    ],
    exports: [
        ContextMenuDirective,
    ],
})
export class ContextMenuModule { }