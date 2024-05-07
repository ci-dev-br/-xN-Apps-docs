import { Component } from "@angular/core";
import { DynamicModule } from "../../dynamic/dynamic.module";
import { IFormOptions } from "src/app/components/dyn-form/i-form-options";

@Component({
    selector: 'ci-editar-produto',
    template: ``,
    imports: [
        DynamicModule,
    ],
    standalone: true,
})
export class EditarProdutoComponent {
    constructor(
        // private readonly service: Produto
    ) { }
    dform?: IFormOptions = {
        fields: [
            // { label: '' }
        ]
    };
}