import { Component, Injector, Optional } from '@angular/core';
import { WindowService } from 'src/app/components/window/window.service';
import { ProjetoComponent } from '../projeto/projeto.component';
import { HttpClient } from '@angular/common/http';
import { AgentService } from '../agent.service';
import { IExcutorAgentMetadata } from '../i-executor';
@Component({
  selector: 'ci-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {
  executores: IExcutorAgentMetadata[] = [
    { name: "Current Agent", agentService: this.agent },
  ];
  constructor(
    private agent?: AgentService,
  ) { }
  executor?: AgentService = this.executores[0]?.agentService;
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = `return await 1+1;`;
  executar() {
    if (this.executor) this.executor.exec(this.code);
  }
  criarProjeto() {
    // this.janela?.open(ProjetoComponent)
  }
  abrirProjeto() {

  }
}
