import { Component } from '@angular/core';
import { WindowService } from 'src/app/components/window/window.service';
import { EditarProdutoComponent } from './editar-produto/editar-produto.component';

@Component({
  selector: 'ci-produtos',
  templateUrl: './produtos.component.html',
  styleUrls: ['./produtos.component.scss']
})
export class ProdutosComponent {
  constructor(
    // private readonly 
    private readonly window: WindowService
  ) { }
  async cadastrarNovo() {
    let a = await this.window.open(EditarProdutoComponent, {})
  }
}
