import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CoreModule } from "src/app/core/core.module";
import { GerencialComponent } from "./gerencial.component";
import { LNavModule } from "src/app/components/l-nav/l-nav.module";

@NgModule({
    declarations: [
        GerencialComponent,
    ],
    imports: [
        CoreModule,
        LNavModule,
        RouterModule.forChild([
            { path: '', component: GerencialComponent }
        ])
    ]
})
export class GerencialModule { }