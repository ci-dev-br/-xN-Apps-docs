import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { CadastrosComponent } from '../cadastros/cadastros.component';
import { MasterDetailComponent } from '@ci/components/master-detail';
const home_children: Routes = [
  {
    path: '', component: CadastrosComponent,
    data: { title: 'Cadastros', icon: 'dashboard' },
    children: [
      {
        path: ':EntityName',
        component: MasterDetailComponent,
      },
    ]
  },];
const routes: Routes = [
  {
    path: '', component: HomeComponent, children: home_children
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
