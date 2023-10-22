import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'painel',
    canActivate: [authGuard],
    loadChildren: () => import('./views/painel/painel.module').then(m => m.PainelModule)
  },
  {
    path: `gerencial`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/gerencial/gerencial.module`).then(m => m.GerencialModule)
  },
  {
    path: `codex`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/codex/codex.module`).then(m => m.CodexModule)
  },
  {
    path: `devtools`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/devtools/devtools.module`).then(m => m.DevtoolsModule)
  },
  {
    path: `vendas`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/vendas/vendas.module`).then(m => m.VendasModule)
  },
  {
    path: `financeiro`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/financeiro/financeiro.module`).then(m => m.FinanceiroModule)
  },
  {
    path: `infra`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/infra/infra.module`).then(m => m.InfraModule)
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
