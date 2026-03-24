import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
import { MasterDetailComponent } from '@ci/components';
const routes: Routes = [
  {
    path: '', component: HomeComponent, data: {
      description: 'O Módulo Financeiro se destaca como a solução ideal para empresas de todos os portes que desejam alcançar um controle financeiro abrangente e preciso. Através de seus recursos robustos e intuitivos, o módulo oferece uma visão geral completa da saúde financeira da sua organização, permitindo que você tome decisões estratégicas com total segurança.'
    },
    children: [
      {
        path: ':EntityName',
        component: MasterDetailComponent,
        data: {
          schema: 'LancamentoFinanceiro' /* TODO: replace at to dictionary */
          // dataType: 'EntityMasterDetail',
          // title: 'Unidade de Medida',
          // icon: 'svg:unidade_medida',
        }
      },
    ]
  },

];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
