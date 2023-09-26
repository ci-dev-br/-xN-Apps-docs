import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeEditorComponent } from './code-editor/code-editor.component';

const routes: Routes = [
  { path: '', component: CodeEditorComponent, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CodexRoutingModule { }
