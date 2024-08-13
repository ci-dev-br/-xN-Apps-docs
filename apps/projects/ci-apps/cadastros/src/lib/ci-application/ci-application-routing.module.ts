import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { CadastrosComponent } from '../cadastros/cadastros.component';
const c: Routes = [
  { path: '', component: CadastrosComponent, data: { title: 'Cadastros', icon: 'dashboard' } },

];
const routes: Routes = [
  {
    path: '', component: HomeComponent, children: c
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
