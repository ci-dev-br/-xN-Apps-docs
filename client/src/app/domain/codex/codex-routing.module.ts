import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { IMenu } from 'src/app/core/i-menu';
const routes: Routes = [
  {
    path: '', children: [
      {
        path: '', component: CodeEditorComponent,
        data: {
          name: 'CodeX',
          icon: 'code',
        }
      }
    ],
    data: {
      name: 'IDE Integrada',
      menu: [
        { label: 'CodeX', route: '', icon: 'code' },
        { label: 'Código Fonte (vscode)', route: '', icon: 'code' },
      ] as IMenu
    }
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class CodexRoutingModule { }
