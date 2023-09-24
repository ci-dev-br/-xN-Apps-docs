import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from '@angular/material/tabs'
import { MatIconModule } from "@angular/material/icon";
import { CoreModule } from "src/app/core/core.module";
import { GerencialComponent } from "./gerencial.component";
import { LNavModule } from "src/app/components/l-nav/l-nav.module";

@NgModule({
    declarations: [
        GerencialComponent,
    ],
    imports: [
        CoreModule,
        MatTabsModule,
        MatIconModule,
        LNavModule,
        RouterModule.forChild([
            { path: '', component: GerencialComponent }
        ])
    ]
})
export class GerencialModule { }