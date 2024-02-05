import { Component, Input } from '@angular/core';
import { IDynamicForm } from '@portal/api';

@Component({
  selector: 'ci-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.scss'
})
export class CadastroComponent {
  @Input()
  dynamicForm?: IDynamicForm;

  constructor() { }
}
