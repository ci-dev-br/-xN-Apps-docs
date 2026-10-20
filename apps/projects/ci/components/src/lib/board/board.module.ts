import { ModuleWithProviders, NgModule } from "@angular/core";
import { CoreModule } from "@ci/core";
import { BoardComponent } from "./board.component";
import { InputModule } from "../input/input.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CardSetting, ImplCard, BoardCardDimensions } from "./card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatChipsModule } from "@angular/material/chips";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule } from "@angular/router";
import { WindowModule } from "../window/src/window.module";
import { CardboardModule } from "@ci/components/cardboard";
import { CardFinderModule } from "../card-finder/card-finder.module";
import { SettingsComponent } from "@ci/components/settings";
import { AppQuickCardComponent } from "./app-quick-card.component";
import { organizeCardMetadata, createGenericAppCard } from "./cards.registry";

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
        MatMenuModule,
        MatSelectModule,
        MatChipsModule,
        FormsModule,
        DragDropModule,
        WindowModule,
        RouterModule,
        MatTooltipModule,
        SettingsComponent,
        CardboardModule,
        CardFinderModule,
        AppQuickCardComponent,
    ],
    declarations: [
        BoardComponent,
    ],
    exports: [
        BoardComponent,
        AppQuickCardComponent,
    ]
})
export class BoardModule {
    public static forFeature(options: {
        cards?: ImplCard[],
        services?: any[],
    }): ModuleWithProviders<BoardModule> {
        return {
            ngModule: BoardModule,
            providers: [
                { provide: CardSetting, useValue: options.cards || [] },
                { provide: 'services', useValue: options.services || [] },
            ]
        }
    }
}

export {
    BoardComponent,
    CardSetting,
    ImplCard,
    BoardCardDimensions,
    AppQuickCardComponent,
    organizeCardMetadata,
    createGenericAppCard,
}
