import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./nav/nav.module').then(m => m.NavModule),
    data: {
      name: 'Vendas',
      icon: 'storefront',
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendasRoutingModule { }
