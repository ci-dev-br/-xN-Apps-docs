import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { SvgEditorComponent } from "./svg-editor.component";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FormsModule } from "@angular/forms";

@NgModule({
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
        MatToolbarModule,
        FormsModule,
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