import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FilesComponent } from './files/files.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: FilesComponent,
        data: {
          appName: 'Arquivos',
          title: 'Explorador de Arquivos',
          icon: 'folder_open',
          description: 'Navegação e gerenciamento de pastas e arquivos',
          queryParam: 'path',
          manifest: {
            'event:explore:directory': {
              component: FilesComponent,
              label: 'Explorar pasta no Arquivos',
              icon: 'folder_open',
              queryParam: 'path',
            },
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

