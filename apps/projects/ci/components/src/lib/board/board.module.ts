import { Inject, ModuleWithProviders, NgModule, Optional, Pipe, PipeTransform } from "@angular/core";
import { CoreModule } from "@ci/core";
import { BoardComponent } from "./board.component";
import { InputModule } from "../input/input.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CardSetting, ImplCard } from "./card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule } from "@angular/router";
import { WindowModule } from "../window/window.module";
import { SettingsComponent } from "../settings/settings.component";
import { CardboardModule } from "@ci/components/cardboard";
import { CardFinderModule } from "../card-finder/card-finder.module";

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
        SettingsComponent,
        CardboardModule,
        CardFinderModule,
    ],
    declarations: [
        BoardComponent,
    ],
    exports: [
        BoardComponent,
    ]
})
export class BoardModule {
    public static forFeature(options: {
        cards: ImplCard[]
    }): ModuleWithProviders<BoardModule> {
        return {
            ngModule: BoardModule,
            providers: [
                { provide: CardSetting, useValue: options.cards || [] }
            ]
        }
    }
}
export {
    BoardComponent,
    CardSetting,
    ImplCard,
}