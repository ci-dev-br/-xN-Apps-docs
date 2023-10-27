import { Component } from '@angular/core';
@Component({
  selector: 'ci-code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent {
  editorOptions = { theme: 'vs-dark', language: 'javascript' };
  code: string = `(function x() {
    alert("Hello world!");
  })();`;
  // agent: I;
  executar() {
    eval(this.code);
  }
}
