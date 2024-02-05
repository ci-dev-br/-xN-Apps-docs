import { Component } from '@angular/core';
import { CadastroService, IDynamicForm } from '@portal/api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'ci-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent {
  menu?: IDynamicForm[];
  constructor(
    private readonly cadastro: CadastroService
  ) {
    this.montarMenu();
  }
  async montarMenu() {
    this.menu = await firstValueFrom(
      this.cadastro.cadastroControllerGetAll({ body: { fields: ['title'] } })
    );
  }
}
