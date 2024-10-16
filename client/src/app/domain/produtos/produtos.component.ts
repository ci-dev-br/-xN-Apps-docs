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
  get _itemSelecionado() {
    return !Array.isArray(this.itemSelecionado) ? this.itemSelecionado : this.itemSelecionado[0];
  }
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
  private _sort?: any;
  set sort(value: any) {
    this._sort = value;
    this.getAll();
  }
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
        skip: 0, take: 0, orderBy: this._sort ? { ...this._sort } : undefined
      }
    }));
  }
  async delete(item: Product | Product[]) {
    if (item && !Array.isArray(item)) {
      await lastValueFrom(
        this.products.productSync({ body: { data: { internalId: item.internalId, deleted: true } as any } })
      )
      let pos = this.lista?.indexOf(item);
      if (pos !== undefined && pos > -1) this.lista?.splice(pos, 1);
      this.lista = [...(this.lista || [])];
      this.itemSelecionado = undefined;
    }
  }
}
