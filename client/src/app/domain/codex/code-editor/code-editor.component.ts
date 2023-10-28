import { Component, Optional } from '@angular/core';
import { JanelaService } from 'src/app/components/janela/janela.service';
import { ProjetoComponent } from '../projeto/projeto.component';
@Component({
  selector: 'ci-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {
  constructor(
    @Optional()
    private readonly janela?: JanelaService,
  ) { }
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = `(function x() {
    alert("Hello world!");
  })();`;
  // agent: I;
  executar() {
    eval(this.code);
  }
  criarProjeto() {
    // this.janela?.open(ProjetoComponent)
  }
  abrirProjeto() {

  }
}
