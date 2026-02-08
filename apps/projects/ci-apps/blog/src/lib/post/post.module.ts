import { NgModule } from "@angular/core";
import { PostComponent } from "./post.component";
import { CoreModule } from "@ci/core";
import { NuMonacoEditorModule } from "@ng-util/monaco-editor";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatToolbarModule } from "@angular/material/toolbar";

@NgModule({
    imports: [
        CoreModule,
        NuMonacoEditorModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatToolbarModule,
    ],
    declarations: [
        PostComponent,
    ],
    exports: [
        PostComponent,
    ]
})
export class PostModule { }