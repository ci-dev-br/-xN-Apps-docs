import { NgModule } from "@angular/core";
import { MatIconRendererComponent } from "./renderers/mat-icon-renderer.component";

@NgModule({
    declarations: [
        MatIconRendererComponent,
    ],
    exports: [
        MatIconRendererComponent,
    ]
})
export class TableModule { }