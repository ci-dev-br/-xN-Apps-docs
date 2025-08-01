import { NgModule } from "@angular/core";
import { CoreModule } from "@ci/core";
import { PesquisarComponent } from "./pesquisar.component";

@NgModule({
    imports: [
        CoreModule,
    ],
    declarations: [
        PesquisarComponent,
    ],
    exports: [
        PesquisarComponent,
    ],

})
export class PesquisarModule { }
export {
    PesquisarComponent,
}