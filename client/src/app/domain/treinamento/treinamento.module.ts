import { NgModule } from "@angular/core";
import { TreinamentoComponent } from "./treinamento.component";
import { CommonModule } from "@angular/common";
@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        TreinamentoComponent,
    ],
    exports: [
        TreinamentoComponent
    ],
})
export class TreinamentoModule { }