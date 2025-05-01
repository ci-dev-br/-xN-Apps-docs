import { ModuleWithProviders, NgModule } from "@angular/core";
import { CoreModule } from "@ci/core";
import { BoardComponent } from "./board.component";
import { InputModule } from "../input/input.module";
import { ReactiveFormsModule } from "@angular/forms";


@NgModule({
    imports: [
        CoreModule,
        InputModule,
        ReactiveFormsModule,
    ],
    declarations: [
        BoardComponent,
    ],
    exports: [
        BoardComponent,
    ]
})
export class BoardModule {
    public static forFeature(): ModuleWithProviders<BoardModule> {
        return {
            ngModule: BoardModule,
            providers: [

            ]
        }
    }
}
export {
    BoardComponent,
}