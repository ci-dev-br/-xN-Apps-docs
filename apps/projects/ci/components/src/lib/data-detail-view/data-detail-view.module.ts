import { NgModule } from "@angular/core";
import { DataDetailViewComponent } from "./data-detail-view.component";
import { CoreModule } from "@ci/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { DataGridModule } from "@ci/components/data-grid";
@NgModule({
    declarations: [
        DataDetailViewComponent,
    ],
    imports: [
        CoreModule,
        MatToolbarModule,
        DataGridModule,
        MatButtonModule,
        MatIconModule,
        MatButtonToggleModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
    ],
    exports: [
        DataDetailViewComponent,
    ]
})
export class DataDetailViewModule { }
export { DataDetailViewComponent }