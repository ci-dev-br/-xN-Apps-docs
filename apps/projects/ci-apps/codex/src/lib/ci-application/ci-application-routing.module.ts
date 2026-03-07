import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CodeEditorComponent } from './code-editor/code-editor.component';
import { HomepageComponent } from './homepage/homepage.component';
import { NavigationComponent } from './navigation/navigation.component';
const routes: Routes = [
  {
    path: '', component: NavigationComponent, children: [
      {
        path: '', component: HomepageComponent,
        data: {
          title: 'Início',
          icon: 'home'
        }
      },
      {
        path: 'editor', component: CodeEditorComponent,
        data: {
          title: 'Editor de Código',
          icon: 'code',
          manifest: {
            'event:open:*.ts': {
              component: CodeEditorComponent,
            }
          }
        }
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
