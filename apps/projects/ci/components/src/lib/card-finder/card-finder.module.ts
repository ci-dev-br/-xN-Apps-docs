import { Inject, ModuleWithProviders, NgModule, Optional, Pipe, PipeTransform } from "@angular/core";
import { CoreModule } from "@ci/core";
import { InputModule } from "../input/input.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { WindowModule } from "../window/src/window.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule } from "@angular/router";
import { CardFinderComponent } from "./card-finder.component";

@NgModule({
    imports: [
        CoreModule,
        InputModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        DragDropModule,
        WindowModule,
        RouterModule,
        MatTooltipModule,
    ],
    declarations: [
        CardFinderComponent,
    ],
    exports: [
        CardFinderComponent,
    ]
})
export class CardFinderModule { }
export {
    CardFinderComponent
}