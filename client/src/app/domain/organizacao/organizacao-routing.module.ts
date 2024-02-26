import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizacaoComponent } from './organizacao.component';

const routes: Routes = [
  {
    path: '', component: OrganizacaoComponent,
    data: {
      name: 'Organização',
      role: 'MASTER'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizacaoRoutingModule { }
