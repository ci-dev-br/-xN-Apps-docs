import { NgModule } from "@angular/core";
import { SvgEditorComponent } from "./svg-editor.component";
import { RouterModule } from "@angular/router";

@NgModule({
    imports: [
        SvgEditorComponent,
        RouterModule.forChild([
            { path: '', component: SvgEditorComponent }
        ])
    ],
    exports: [
        SvgEditorComponent,
    ],
})
export class SvgEditorModule { }
