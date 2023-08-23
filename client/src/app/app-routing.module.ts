import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./views/homepage/homepage.module').then(m => m.HomepageModule) },
  { path: 'acessar', loadChildren: () => import('./views/acessar/acessar.module').then(m => m.AcessarModule) },
  { path: 'painel', loadChildren: () => import('./views/painel/painel.module').then(m => m.PainelModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
