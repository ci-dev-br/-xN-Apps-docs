import { Component, OnInit } from '@angular/core';
import { WindowService } from 'src/app/components/window/window.service';
import { EditarProdutoComponent } from './editar-produto/editar-produto.component';
import { Product, ProductService } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { DataGridOptions } from 'src/app/components/grid/data-grid.options';
import { t } from 'src/app/core/i18n/t.service';

@Component({
  selector: 'ci-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  lista?: Product[] = [];
  grid: DataGridOptions = {
    colums: [

      { fieldName: t`codigoBarras`, headerName: 'codigoBarras' },
      { fieldName: t`codigoFabricanete`, headerName: 'codigoFabricanete' },
      { fieldName: t`createdAt`, headerName: 'createdAt' },
      { fieldName: t`createdBy`, headerName: 'createdBy' },
      { fieldName: t`description`, headerName: 'description' },
      { fieldName: t`gtin`, headerName: 'gtin' },
      { fieldName: t`internalId`, headerName: 'internalId' },
      { fieldName: t`lastModifiedAt`, headerName: 'lastModifiedAt' },
      { fieldName: t`lastModifiedBy`, headerName: 'lastModifiedBy' },
      { fieldName: t`marca`, headerName: 'marca' },
      { fieldName: t`nossoCodigo`, headerName: 'nossoCodigo' },
      { fieldName: t`shortDescription`, headerName: 'shortDescription' },
      { fieldName: t`subGrupo`, headerName: 'subGrupo' },
      { fieldName: t`tenants`, headerName: 'tenants' },
      { fieldName: t`urlWebsiteOficial`, headerName: 'urlWebsiteOficial' },
    ]
  };
  constructor(
    private readonly products: ProductService,
    private readonly window: WindowService
  ) { }
  async cadastrarNovo() {
    let a = await this.window.open(EditarProdutoComponent, {})
  }
  async ngOnInit() {
    this.getAll();
  }
  async getAll() {
    return this.lista = await lastValueFrom(this.products.productGet({
      body: {
        skip: 0, take: 0
      }
    }));
  }
}
