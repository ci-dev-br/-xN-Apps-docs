import { Component, Inject, Optional } from "@angular/core";
import { FormOptionsBuilder, IFormOptions } from "src/app/components/dyn-form/i-form-options";
import { DynFormModule } from "src/app/components/dyn-form/dyn-form.module";
import { MarcaService } from "../services/marca.service";
import { DaoService, IChangeable } from "src/app/core/dao/dao.service";
import { Product, ProductService } from "@portal/api";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FormGroup } from "@angular/forms";
import { CoreModule } from "src/app/core/core.module";
import { lastValueFrom } from "rxjs";

@Component({
    selector: 'ci-editar-produto',
    template: `<ci-dyn-form [source]="formOptions" [formGroup]="form" ></ci-dyn-form> {{data | json}}`,
    imports: [
        CoreModule,
        DynFormModule,
    ],
    standalone: true,
})
export class EditarProdutoComponent {
    formOptions?: IFormOptions = {
        title: 'Produto',
        description: 'Cadastramento do Produto',
        fields: [
            { label: 'Código de Barras', property: 'codigoBarras', type: 'text' },
            { label: 'Código do Fabricanete', property: 'codigoFabricanete', type: 'text' },
            { label: 'Descrição', property: 'description', type: 'text' },
            { label: 'GTIN', property: 'gtin', type: 'text', },
            { label: 'SKU', property: 'sku', type: 'text', },
            // { label: 'Marca', property: 'marca', dataService: this.marcaService },
            { label: 'Nosso Codigo', property: 'nossoCodigo', type: 'text' },
            { label: 'Descrição curta', property: 'shortDescription', type: 'text' },
            // { label: 'Sub Grupo', property: 'subGrupo', type: 'text' },
            { label: 'URL Site Oficial', property: 'urlWebsiteOficial', type: 'text' },

            // { label: 'createdAt', property: 'createdAt', },
            // { label: 'createdBy', property: 'createdBy', },
            // { label: 'internalId', property: 'internalId', },
            // { label: 'lastModifiedAt', property: 'lastModifiedAt', type: 'text' },
            // { label: 'lastModifiedBy', property: 'lastModifiedBy', type: 'text' },
            // { label: 'tenants', property: 'tenants', },
        ]
    };
    form?: FormGroup;
    constructor(
        private readonly productService: ProductService,
        private readonly marcaService: MarcaService,
        private readonly dao: DaoService,
        @Optional()
        @Inject(MAT_DIALOG_DATA)
        public readonly data: Product,
        private readonly fob: FormOptionsBuilder,
    ) {
        this.dao.prepareToEdit(data);
        if (this.formOptions) this.form = fob.options(this.formOptions);
        if (this.form) this.dao.bindDataForm(data, this.form);
        this.dao.confirmation(data)?.subscribe(async _data => {
            try {
                if (_data && data) {
                    Object.assign(data,
                        await lastValueFrom(this.productService.productSync({ body: { data: { ..._data, internalId: data.internalId } } }))
                    );
                    delete (this.data as IChangeable).__pre;
                    dao.prepareToEdit(this.data);
                    if (this.form) dao.bindDataForm(this.data, this.form);
                }
            } catch (error) {

            }
        });
    }

}