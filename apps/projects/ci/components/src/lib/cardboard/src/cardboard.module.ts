import { NgModule } from "@angular/core";
import { CoreModule } from "@ci/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { CardboardComponent } from "./cardboard.component";

@NgModule({
    imports: [
        CoreModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        DragDropModule,
    ],
    declarations: [
        CardboardComponent,
    ],
    exports: [
        CardboardComponent,
    ]
})
export class CardboardModule { }
export {
    CardboardComponent,
}
