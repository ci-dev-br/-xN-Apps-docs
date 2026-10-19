import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { GrupoDetalheComponent } from './grupo-detalhe/grupo-detalhe.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Grupos e Comunidades'
  },
  {
    path: ':id',
    component: GrupoDetalheComponent,
    title: 'Comunidade'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
