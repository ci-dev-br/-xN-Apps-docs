import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelComponent } from './painel.component';

const routes: Routes = [
  {
    path: '', component: PainelComponent,
    data: {
      name: 'Pranchetas',
      icon: 'dashboard'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainelRoutingModule { }
