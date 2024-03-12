import { NgModule } from "@angular/core";
import { MasterDetailComponent } from "./master-detail.component";
import { LNavModule } from "../l-nav/l-nav.module";
import { ToolbarModule } from "../toolbar/toolbar.module";

@NgModule({
    declarations: [
        MasterDetailComponent,
    ],
    imports: [
        LNavModule,
        ToolbarModule,
    ],
    exports: [
        MasterDetailComponent,
    ]
})
export class MasterDetailModule { }