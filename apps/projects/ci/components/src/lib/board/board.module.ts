import { Inject, ModuleWithProviders, NgModule, Optional, Pipe, PipeTransform } from "@angular/core";
import { CoreModule } from "@ci/core";
import { BoardComponent } from "./board.component";
import { InputModule } from "../input/input.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CardSetting, ImplCard } from "./card";
import { CardFinderComponent } from "./card-finder/card-finder.component";
import { MatDialogModule } from "@angular/material/dialog";
import { Card } from "@ci/portal-api";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { WindowModule } from "../window/window.module";
import { SettingsComponent } from "../settings/settings.component";
import { CardContainerComponent } from "./card-container/card-container.component";
import { MatTooltipModule } from "@angular/material/tooltip";

@Pipe({ name: 'cardComponent', pure: true })
export class CardComponentPipe implements PipeTransform {
    constructor(
        @Optional() @Inject(CardSetting)
        public cardsFound?: ImplCard[],
    ) { }
    transform(value: Card, ...args: any[]) {
        return this.cardsFound?.find(c => c.componentName === value.componentName)
    }
}
/**
 * 
 */
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
        MatTooltipModule,
        SettingsComponent,
    ],
    declarations: [
        CardFinderComponent,
        BoardComponent,
        CardContainerComponent,
    ],
    exports: [
        CardFinderComponent,
        BoardComponent,
        CardContainerComponent,
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