import { Component } from '@angular/core';
import { CoreModule } from '@ci/core';
import { CadastroService, IDynamicForm } from '@ci/portal-api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'ci-cadastros',
  standalone: true,
  imports: [
    CoreModule,
  ],
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class CadastrosComponent {
  currentForm?: IDynamicForm;
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
  async abrirItemMenu(title: string) {
    const item = await firstValueFrom(
      this.cadastro.cadastroControllerGetAll({ body: { by: 'title', equals: title } })
    );
    if (item && item.length === 1) {
      this.abrir(item[0]);
    }
  }
  abrir(form: IDynamicForm) {
    this.currentForm = form;
  }
}
