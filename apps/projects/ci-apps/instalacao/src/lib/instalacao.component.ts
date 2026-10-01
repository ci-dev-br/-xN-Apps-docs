import { Component } from '@angular/core';
import { DynFormModule } from '@ci/components/dyn-form';

@Component({
  selector: 'ci-Instalacao',
  imports: [
    DynFormModule
  ],
  template: `
    <ci-dyn-form [schemaName]="" ></ci-dyn-form>
  `,
  styles: ``
})
export class InstalacaoComponent {

}
