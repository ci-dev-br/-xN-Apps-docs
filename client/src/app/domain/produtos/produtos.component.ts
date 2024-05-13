import { Component, OnInit } from '@angular/core';
import { WindowService } from 'src/app/components/window/window.service';
import { EditarProdutoComponent } from './editar-produto/editar-produto.component';
import { Product, ProductService } from '@portal/api';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'ci-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent implements OnInit {
  lista?: Product[] = [];
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
