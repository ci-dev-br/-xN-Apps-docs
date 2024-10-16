import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { SvgEditorComponent } from "./svg-editor.component";
import { CoreModule } from "@ci/core";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        CoreModule,
        MatIconModule,
        MatButtonModule,
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