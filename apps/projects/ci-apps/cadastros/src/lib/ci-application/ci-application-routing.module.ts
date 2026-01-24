import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { CadastrosComponent } from '../cadastros/cadastros.component';
import { MasterDetailComponent } from '../cadastros/master-detail/master-detail.component';
const home_children: Routes = [
  {
    path: '', component: CadastrosComponent, data: { title: 'Cadastros', icon: 'dashboard' }, children: [
      {
        path: ':EntityName',
        component: MasterDetailComponent,
        data: {
          /// dataType: 'EntityMasterDetail', title: 'Unidade de Medida', icon: 'svg:unidade_medida',
        }
      },
      /* {
        path: 'pessoa', component: MasterDetailComponent, data: {
          dataType: 'Pessoa', title: 'Pessoa', icon: 'person',
        }
      }, */
      /*  {
         path: 'endereco', component: MasterDetailComponent, data: {
           dataType: 'Endereco', title: 'Endereço', icon: 'map',
         }
       }, */
    ]
  },
];
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
