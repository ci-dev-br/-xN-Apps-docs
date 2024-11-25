import { Component } from '@angular/core';

@Component({
    selector: 'ci-Mensagens',
    imports: [],
    template: `
    <p>
      Envie e receba mensagens sem precisar manter seu celular conectado na internet. Use o Mensagens em até 2 dispositivos conectados em um celular ao mesmo tempo.
    </p>
  `,
    styles: `
    :host{
      flex: auto;
      padding: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `
})
export class MensagensComponent {

}
