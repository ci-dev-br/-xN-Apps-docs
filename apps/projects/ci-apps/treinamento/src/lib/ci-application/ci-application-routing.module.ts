import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Treinamentos & Universidade Corporativa',
      icon: 'school',
      manifest: {
        'event:study:curso': {
          component: HomeComponent,
          label: 'Treinamento (Catálogo e Aulas)',
          icon: 'school',
          queryParam: 'cursoId',
        }
      }
    }
  },
  {
    path: 'Create',
    component: HomeComponent,
    data: { title: 'Painel do Instrutor', icon: 'video_call', mode: 'instrutor' }
  },
  {
    path: 'instrutor',
    component: HomeComponent,
    data: { title: 'Painel do Instrutor', icon: 'video_call', mode: 'instrutor' }
  },
  {
    path: 'curso',
    component: HomeComponent,
    data: { title: 'Treinamento', icon: 'play_circle', mode: 'catalog' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
