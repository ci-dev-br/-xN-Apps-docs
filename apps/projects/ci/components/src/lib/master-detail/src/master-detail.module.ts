import { NgModule } from "@angular/core";
import { MasterDetailComponent } from "./master-detail.component";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { FormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        MasterDetailComponent,
    ],
    imports: [
        CoreModule,
        RouterModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatIconModule,
        MatButtonModule,
        FormsModule,
    ],
    exports: [
        MasterDetailComponent
    ]
})
export class MasterDetailModule { }