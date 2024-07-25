import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { CodeEditorComponent } from './code-editor/code-editor.component';
const routes: Routes = [
  {
    path: '', component: HomeComponent, children: [
      { path: '', component: CodeEditorComponent, data: { title: 'Editor de Código', icon: 'code' } },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
