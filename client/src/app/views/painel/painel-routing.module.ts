import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelComponent } from './painel.component';
import { InicioComponent } from './inicio/inicio.component';

const routes: Routes = [
  {
    path: '', component: PainelComponent,
    data: {
      name: 'Pranchetas',
      icon: 'dashboard'
    },
    children: [
      { path: '', component: InicioComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainelRoutingModule { }
