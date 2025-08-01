import { NgModule } from "@angular/core";
import { DataDetailViewComponent } from "./data-detail-view.component";
import { CoreModule } from "@ci/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { DataListModule } from "../data-list/data-list.module";
import { GridModule } from "../data-grid/grid.module";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";


@NgModule({
    declarations: [
        DataDetailViewComponent,
    ],
    imports: [
        CoreModule,
        MatToolbarModule,
        DataListModule,
        GridModule,
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