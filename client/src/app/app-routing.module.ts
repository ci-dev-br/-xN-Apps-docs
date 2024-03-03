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
    data: { role: 'MASTER', policy: 'br.com.plhx.manager' }
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
    path: `produtos`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/produtos/produtos.module`).then(m => m.ProdutosModule),
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
  {
    path: `profile`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/profile/profile.module`).then(m => m.ProfileModule),
    data: { role: 'USER' }
  },
  {
    path: `cadastros`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/cadastros/cadastros.module`).then(m => m.CadastrosModule),
    data: { role: 'ADMIN', data: 'Cadastros', icon: 'menu_books' }
  },
  {
    path: `mensagens`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/mensagens/mensagens.module`).then(m => m.MensagensModule),
    data: { role: 'USER', data: 'Mensagens', icon: 'menu_books' }
  },
  {
    path: `arquivos`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/arquivos/arquivos.module`).then(m => m.ArquivosModule),
    data: { role: 'ADMIN', data: 'Mensagens', icon: 'menu_books' }
  },
  {
    path: `organizacao`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/organizacao/organizacao.module`).then(m => m.OrganizacaoModule),
    data: { role: 'ADMIN', data: 'Organização', icon: 'corporate_fare' }
  },
  {
    path: `novo`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/novo/novo.module`).then(m => m.NovoModule),
    data: { role: 'ADMIN', data: 'Nova criação', icon: 'new' }
  },
  {
    path: `novo`,
    canActivate: [authGuard],
    loadChildren: () => import(`./domain/imersao/imersao.module`).then(m => m.ImersaoModule),
    data: { role: 'ADMIN', data: 'Nova criação', icon: 'new' }
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
