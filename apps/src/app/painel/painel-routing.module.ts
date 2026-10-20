import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelComponent } from './painel.component';
import { AppContextGuard, APP_DOCUMENTATION_REGISTRY } from '@ci/core';

export const routes: Routes = [
  { path: 'launcher', loadChildren: () => import('@ci/Launcher').then(m => m.LauncherRouterModule) },
  {
    path: '', component: PainelComponent, canActivateChild: [AppContextGuard], children: [
      { path: '', loadChildren: () => import('@ci/Launcher').then(m => m.LauncherRouterModule) },
      { path: 'meus-apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule) },
      {
        path: 'Loja',
        data: {
          docs: APP_DOCUMENTATION_REGISTRY['Loja'],
          title: 'Loja de Aplicativos',
          icon: 'storefront'
        },
        loadComponent: () => import('@ci-apps/Gerencial').then(m => m.LojaComponent)
      },
      {
        path: 'Arquivos',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Arquivos'] },
        loadChildren: () => import('@ci-apps/Arquivos').then(m => m.CiApplicationModule)
      },
      {
        path: 'Codex',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Codex'] },
        loadChildren: () => import('@ci-apps/Codex').then(m => m.CiApplicationModule)
      },
      {
        path: 'CMS',
        data: { docs: APP_DOCUMENTATION_REGISTRY['CMS'] },
        loadChildren: () => import('@ci-apps/cms').then(m => m.CiApplicationModule)
      },
      {
        path: 'Financeiro',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Financeiro'] },
        loadChildren: () => import('@ci-apps/Financeiro').then(m => m.CiApplicationModule)
      },
      {
        path: 'CRM',
        data: { docs: APP_DOCUMENTATION_REGISTRY['CRM'] },
        loadChildren: () => import('@ci-apps/crm').then(m => m.CiApplicationModule)
      },
      {
        path: 'Cadastros',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Cadastros'] },
        loadChildren: () => import('@ci-apps/Cadastros').then(m => m.CiApplicationModule)
      },
      {
        path: 'DevTools',
        data: { docs: APP_DOCUMENTATION_REGISTRY['DevTools'] },
        loadChildren: () => import('@ci-apps/DevTools').then(m => m.CiApplicationModule)
      },
      {
        path: 'Dynamic',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Dynamic'] },
        loadChildren: () => import('@ci-apps/Dynamic').then(m => m.CiApplicationModule)
      },
      {
        path: 'LowCode',
        data: { docs: APP_DOCUMENTATION_REGISTRY['LowCode'] },
        loadChildren: () => import('@ci-apps/LowCode').then(m => m.CiApplicationModule)
      },
      {
        path: 'Organizacao',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Organizacao'] },
        loadChildren: () => import('@ci-apps/Organizacao').then(m => m.CiApplicationModule)
      },
      {
        path: 'Gerencial',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Gerencial'] },
        loadChildren: () => import('@ci-apps/Gerencial').then(m => m.CiApplicationModule)
      },
      {
        path: 'Installation',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Installation'] },
        loadChildren: () => import('@ci-apps/Instalacao').then(m => m.CiApplicationModule)
      },
      {
        path: 'Mensagens',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Mensagens'] },
        loadChildren: () => import('@ci-apps/Mensagens').then(m => m.CiApplicationModule)
      },
      {
        path: 'Produtos',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Produtos'] },
        loadChildren: () => import('@ci-apps/Produtos').then(m => m.CiApplicationModule)
      },
      {
        path: 'Profile',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Profile'] },
        loadChildren: () => import('@ci-apps/Profile').then(m => m.CiApplicationModule)
      },
      {
        path: 'Projetos',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Projetos'] },
        loadChildren: () => import('@ci-apps/Projetos').then(m => m.CiApplicationModule)
      },
      {
        path: 'SEO',
        data: { docs: APP_DOCUMENTATION_REGISTRY['SEO'] },
        loadChildren: () => import('@ci-apps/SEO').then(m => m.CiApplicationModule)
      },
      {
        path: 'Threejs',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Threejs'] },
        loadChildren: () => import('@ci-apps/Threejs').then(m => m.CiApplicationModule)
      },
      {
        path: 'Estudos',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Estudos'] },
        loadChildren: () => import('@ci-apps/Estudos').then(m => m.CiApplicationModule)
      },
      {
        path: 'Treinamento',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Treinamento'] },
        loadChildren: () => import('@ci-apps/Treinamento').then(m => m.CiApplicationModule)
      },
      {
        path: 'Vendas',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Vendas'] },
        loadChildren: () => import('@ci-apps/Vendas').then(m => m.CiApplicationModule)
      },
      {
        path: 'Icons',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Icons'] },
        loadChildren: () => import('@ci-apps/Icons').then(m => m.CiApplicationModule)
      },
      {
        path: 'Composite',
        loadComponent: () => import('@ci-apps/Imersao').then(i => i.CompositorComponent)
      },
      {
        path: 'Imersao',
        data: {
          docs: APP_DOCUMENTATION_REGISTRY['Imersao'],
          LoadIcons: {
            imersao: { url: 'icons/imersao.svg' },
          }
        },
        loadChildren: () => import('@ci-apps/Imersao').then(m => m.CiApplicationModule)
      },
      {
        path: 'Formularios',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Formularios'] },
        loadChildren: () => import('@ci-apps/Formularios').then(m => m.CiApplicationModule)
      },
      {
        path: 'Grupos',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Grupos'] },
        loadChildren: () => import('@ci-apps/grupos').then(m => m.CiApplicationModule)
      },
      {
        path: 'Infra',
        data: { docs: APP_DOCUMENTATION_REGISTRY['Infra'] },
        loadChildren: () => import('@ci-apps/Infra').then(m => m.CiApplicationModule)
      },
      {
        path: 'BeautyCRM',
        data: {
          title: 'Beauty CRM',
          icon: 'crm'
        },
        loadComponent: () => import('./apps/combined-app/combined-app.component').then(m => m.CombinedAppComponent)
      },
      {
        path: 'app-combinada/:appKey',
        loadComponent: () => import('./apps/combined-app/combined-app.component').then(m => m.CombinedAppComponent)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainelRoutingModule { }

