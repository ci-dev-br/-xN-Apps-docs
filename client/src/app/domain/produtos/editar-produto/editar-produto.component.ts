import { Component } from "@angular/core";
import { DynamicModule } from "../../dynamic/dynamic.module";
import { IFormOptions } from "src/app/components/dyn-form/i-form-options";
import { DynFormModule } from "src/app/components/dyn-form/dyn-form.module";
import { MarcaService } from "../services/marca.service";

@Component({
    selector: 'ci-editar-produto',
    template: `<ci-dyn-form [source]="form" ></ci-dyn-form>`,
    imports: [
        DynFormModule
    ],
    standalone: true,
})
export class EditarProdutoComponent {
    constructor(
        // private readonly service: Produto
    ) { }
    form?: IFormOptions = {
        title: 'Produto',
        description: 'Cadastramento do Produto',
        fields: [
            { label: 'Código de Barras', property: 'codigoBarras', type: 'text' },
            { label: 'Código do Fabricanete', property: 'codigoFabricanete', type: 'text' },
            { label: 'Descrição', property: 'description', type: 'text' },
            { label: 'GTIN', property: 'gtin', type: 'text', },
            { label: 'Marca', property: 'marca', dataService: MarcaService },
            { label: 'Nosso Codigo', property: 'nossoCodigo', type: 'text' },
            { label: 'Descrição curta', property: 'shortDescription', type: 'text' },
            { label: 'Sub Grupo', property: 'subGrupo', type: 'text' },
            { label: 'URL Site Oficial', property: 'urlWebsiteOficial', type: 'text' },
            // { label: 'createdAt', property: 'createdAt', },
            // { label: 'createdBy', property: 'createdBy', },
            // { label: 'internalId', property: 'internalId', },
            // { label: 'lastModifiedAt', property: 'lastModifiedAt', type: 'text' },
            // { label: 'lastModifiedBy', property: 'lastModifiedBy', type: 'text' },
            // { label: 'tenants', property: 'tenants', },
        ]
    };
}