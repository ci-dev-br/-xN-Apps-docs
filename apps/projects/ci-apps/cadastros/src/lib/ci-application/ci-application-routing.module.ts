import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
const home_children: Routes = [
];
// {
//   path: '', component: CadastrosComponent, data: { title: 'Cadastros', icon: 'dashboard' }, children: [
//     /*  {
//        path: '',
//        component: undefined
//      }, */
//     {
//       path: ':EntityName',
//       component: MasterDetailComponent,
//     },
//   ]
// },
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
