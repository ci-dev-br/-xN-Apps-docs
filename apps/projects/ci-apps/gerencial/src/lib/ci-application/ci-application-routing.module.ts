import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'Painel', loadChildren: () => import('./../gerencial.module').then(m => m.GerencialModule) },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
