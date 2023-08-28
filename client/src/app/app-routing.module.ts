import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'painel',
    canActivate: [authGuard],
    loadChildren: () => import('./views/painel/painel.module').then(m => m.PainelModule)
  },
  { path: '', loadChildren: () => import('./views/homepage/homepage.module').then(m => m.HomepageModule) },
  { path: 'acessar', loadChildren: () => import('./views/acessar/acessar.module').then(m => m.AcessarModule) },
  { path: 'criar-conta', loadChildren: () => import('./views/criar-conta/criar-conta.module').then(m => m.CriarContaModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
