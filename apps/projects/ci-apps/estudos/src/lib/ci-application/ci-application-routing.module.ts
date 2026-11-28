import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstudosComponent } from '../estudos.component';

const routes: Routes = [
  {
    path: '',
    component: EstudosComponent,
    data: {
      title: 'Estudos & Acompanhamento de Aulas',
      icon: 'menu_book',
      manifest: {
        'event:study:curso': {
          component: EstudosComponent,
          label: 'Estudos (Acompanhar Aulas & Anotações)',
          icon: 'menu_book',
          queryParam: 'cursoId',
        },
        'event:study:aula': {
          component: EstudosComponent,
          label: 'Estudos (Assistir & Anotar)',
          icon: 'edit_note',
          queryParam: 'aulaId',
        }
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
