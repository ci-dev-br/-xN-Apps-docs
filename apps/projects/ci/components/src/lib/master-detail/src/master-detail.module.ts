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
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatBadgeModule } from "@angular/material/badge";
import { FormsModule } from "@angular/forms";
import { DataGridModule } from "@ci/components/data-grid";
import { EditarDetailModule } from "@ci/components/editar-detail";
import { WindowModule } from "@ci/components/window";

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
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCardModule,
        MatChipsModule,
        MatBadgeModule,
        FormsModule,
        DataGridModule,
        EditarDetailModule,
        WindowModule,
    ],
    exports: [
        MasterDetailComponent,
        WindowModule,
    ]
})
export class MasterDetailModule { }