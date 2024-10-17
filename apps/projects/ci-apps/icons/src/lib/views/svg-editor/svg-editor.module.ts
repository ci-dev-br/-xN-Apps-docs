import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { SvgEditorComponent } from "./svg-editor.component";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { FormsModule } from "@angular/forms";
import { ActionModule } from "@ci/components";

@NgModule({
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        FormsModule,
        MatMenuModule,
        ActionModule,
        RouterModule.forChild([
            { path: '', component: SvgEditorComponent }
        ])
    ],
    declarations: [
        SvgEditorComponent,
    ],
    exports: [
        SvgEditorComponent,
    ],
})
export class SvgEditorModule { }