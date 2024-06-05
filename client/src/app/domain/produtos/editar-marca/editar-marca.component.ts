import { Component } from "@angular/core";
import { IFormOptions } from "src/app/components/dyn-form/i-form-options";
import { DynFormModule } from "src/app/components/dyn-form/dyn-form.module";

@Component({
    selector: 'ci-editar-marca',
    template: `<ci-dyn-form [source]="form" ></ci-dyn-form>`,
    imports: [
        DynFormModule
    ],
    standalone: true,
})
export class EditarMarcaComponent {
    constructor(
        // private readonly service: Produto
    ) { }
    form?: IFormOptions = {
        title: 'Marca',
        description: 'Cadastramento de Marcas',
        fields: [
        ]
    };
}