import { ModuleWithProviders, NgModule } from "@angular/core";
import { CoreModule } from "@ci/core";
import { BoardComponent } from "./board.component";


@NgModule({
    imports: [
        CoreModule,
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