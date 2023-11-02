import { Component, Injector, Optional } from '@angular/core';
import { JanelaService } from 'src/app/components/janela/janela.service';
import { ProjetoComponent } from '../projeto/projeto.component';
@Component({
  selector: 'ci-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {
  constructor(
    private readonly injetor?: Injector,
    @Optional()
    private readonly janela?: JanelaService,
  ) { }
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = ``;
  // agent: I;
  private santizeScript(text: string) {
    return text
      .replace(/(this)/g, '_internal_this')
      .replace(/(undefined)/g, '__undefined__')
      .replace(/(true)/g, '__true__')
      .replace(/(false)/g, '__false__')
      .replace(/(alert|document|window|console)/g, '__undefined__')
  }
  executar() {
    try {
      (() => {
        const __undefined__ = undefined;
        const __null__ = null;
        const __true__ = true;
        const __false__ = false;

        const _internal_this = {
          injetor: this.injetor,
          janela: this.janela,
        };
        eval(this.santizeScript(this.code));
      })();
    } catch (error) {

    }
  }
  criarProjeto() {
    // this.janela?.open(ProjetoComponent)
  }
  abrirProjeto() {

  }
}
