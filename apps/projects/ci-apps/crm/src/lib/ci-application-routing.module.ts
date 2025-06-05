import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { CrmComponent } from './crm/crm.component';
import { MasterDetailComponent } from '../../../cadastros/src/lib/cadastros/master-detail/master-detail.component';

const cadastros = [
  'Agendamento',
  'Atendimento',
  'ClienteCrm',
  'HistoricoContato',
  'Produto',
  'Profissional',
  'Promocao',
  'Servico',
  'VendaProduto',
]
const routes: Routes = [
  {
    path: '', component: CrmComponent, children: [
      ...cadastros.map(c => {
        return {
          path: `${c}`, component: MasterDetailComponent, data: {
            schema: `${c}`, title: `${c}`, icon: `svg:${c}`,
          }
        } as Route
      })
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
