import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavComponent } from './nav.component';

const routes: Routes = [
  {
    path: '', component: NavComponent, children: [
      { path: '', loadChildren: () => import('./../inicio/inicio.module').then(m => m.InicioModule) },
    ], data: {
      name: 'Vendas'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavRoutingModule { }
