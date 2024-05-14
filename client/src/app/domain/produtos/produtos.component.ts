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
  itemSelecionado?: Product | Product[];
  grid: DataGridOptions = {
    colums: [

      { fieldName: 'sku', headerName: t`SKU` },
      { fieldName: 'codigoBarras', headerName: t`codigoBarras` },
      { fieldName: 'codigoFabricanete', headerName: t`codigoFabricanete` },
      { fieldName: 'createdAt', headerName: t`createdAt`, defaultVisible: false },
      { fieldName: 'createdBy', headerName: t`createdBy`, defaultVisible: false },
      { fieldName: 'description', headerName: t`description` },
      { fieldName: 'gtin', headerName: t`gtin` },
      { fieldName: 'internalId', headerName: t`internalId`, hide: true },
      { fieldName: 'lastModifiedAt', headerName: t`lastModifiedAt`, defaultVisible: false },
      { fieldName: 'lastModifiedBy', headerName: t`lastModifiedBy`, defaultVisible: false },
      { fieldName: 'marca', headerName: t`marca` },
      { fieldName: 'nossoCodigo', headerName: t`nossoCodigo` },
      { fieldName: 'shortDescription', headerName: t`shortDescription` },
      { fieldName: 'subGrupo', headerName: t`subGrupo` },
      { fieldName: 'tenants', headerName: t`tenants`, defaultVisible: false },
      { fieldName: 'urlWebsiteOficial', headerName: t`urlWebsiteOficial` },
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
        skip: 0, take: 0, orderBy: { sku: 'ASC' }
      }
    }));
  }
}
