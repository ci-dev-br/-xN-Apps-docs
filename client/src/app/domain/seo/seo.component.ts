import { Component, OnInit } from '@angular/core';
import { WindowService } from 'src/app/components/window/window.service';
// import { EditarProdutoComponent } from './editar-produto/editar-produto.component';
import { Product, ProductService } from '@portal/api';
import { lastValueFrom } from 'rxjs';
import { DataGridOptions } from 'src/app/components/grid/data-grid.options';
import { t } from 'src/app/core/i18n/t.service';

@Component({
  selector: 'ci-seo',
  templateUrl: './seo.component.html',
  styleUrls: ['./seo.component.scss']
})
export class SeoComponent implements OnInit {
  lista?: Product[] = [];
  itemSelecionado?: Product | Product[];
  get _itemSelecionado() {
    return !Array.isArray(this.itemSelecionado) ? this.itemSelecionado : this.itemSelecionado[0];
  }
  grid: DataGridOptions = {
    colums: [

      { fieldName: 'sku', headerName: t`SKU` },
      
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
    // let a = await this.window.open(EditarProdutoComponent, {})
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
