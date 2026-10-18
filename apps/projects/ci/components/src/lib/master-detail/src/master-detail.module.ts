import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MasterDetailComponent } from "./master-detail.component";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule } from "@angular/forms";
import { DataGridModule } from "@ci/components/data-grid";
import { EditarDetailModule } from "@ci/components/editar-detail";

@NgModule({
    declarations: [
        MasterDetailComponent,
    ],
    imports: [
        CommonModule,
        CoreModule,
        RouterModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        FormsModule,
        DataGridModule,
        EditarDetailModule,
    ],
    exports: [
        MasterDetailComponent,
    ]
})
export class MasterDetailModule { }