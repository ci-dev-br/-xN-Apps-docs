import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CoreModule } from '@ci/core';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

@Component({
  selector: 'ci-code-editor',
  standalone: true,
  imports: [
    CoreModule,
    NuMonacoEditorModule,
    FormsModule,
  ],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.scss'
})
export class CodeEditorComponent {
  value: string = 'const a = 1;';
  editorOptions = { theme: 'vs-dark', language: 'typescript' };
}
