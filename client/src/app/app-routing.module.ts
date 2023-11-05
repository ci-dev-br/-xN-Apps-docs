import { NgModule } from '@angular/core';
import { Route, RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

const routes: Routes = [
  {
    path: 'painel',
    canActivate: [authGuard],
    loadChildren: () => import('./views/painel/painel.module').then(m => m.PainelModule),
    data: {
      name: 'Dashboard',
      icon: 'dashboard'
    }
  },
  {
    path: `gerencial`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/gerencial/gerencial.module`).then(m => m.GerencialModule),
    data: { role: 'MASTER' }
  },
  {
    path: `codex`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/codex/codex.module`).then(m => m.CodexModule),
    data: { role: 'ADMIN' }
  },
  {
    path: `devtools`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/devtools/devtools.module`).then(m => m.DevtoolsModule),
    data: { role: 'ADMIN' }
  },
  {
    path: `vendas`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/vendas/vendas.module`).then(m => m.VendasModule),
    data: { role: 'ADMIN' }
  },
  {
    path: `financeiro`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/financeiro/financeiro.module`).then(m => m.FinanceiroModule),
    data: { role: 'ADMIN' }
  },
  {
    path: `infra`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/infra/infra.module`).then(m => m.InfraModule),
    data: { role: 'ADMIN' }
  },
  {
    path: `threejs`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/threejs/threejs.module`).then(m => m.ThreejsModule)
  },
  {
    path: `docs`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/threejs/threejs.module`).then(m => m.ThreejsModule),
    data: { role: 'ADMIN' }
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
