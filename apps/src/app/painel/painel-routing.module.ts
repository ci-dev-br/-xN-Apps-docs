import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelComponent } from './painel.component';


const routes: Routes = [
  {
    path: '', component: PainelComponent, children: [
      { path: 'meus-apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule) },
      { path: 'Arquivos', loadChildren: () => import('@ci-apps/Arquivos').then(m => m.CiApplicationModule) },
      { path: 'Cadastros', loadChildren: () => import('@ci-apps/Cadastros').then(m => m.CiApplicationModule) },
      { path: 'Codex', loadChildren: () => import('@ci-apps/Codex').then(m => m.CiApplicationModule) },
      { path: 'DevTools', loadChildren: () => import('@ci-apps/DevTools').then(m => m.CiApplicationModule) },
      { path: 'Dynamic', loadChildren: () => import('@ci-apps/Dynamic').then(m => m.CiApplicationModule) },
      { path: 'Financeiro', loadChildren: () => import('@ci-apps/Financeiro').then(m => m.CiApplicationModule) },
      { path: 'Formularios', loadChildren: () => import('@ci-apps/Formularios').then(m => m.CiApplicationModule) },
      { path: 'Gerencial', loadChildren: () => import('@ci-apps/Gerencial').then(m => m.CiApplicationModule) },
      { path: 'Icons', loadChildren: () => import('@ci-apps/Icons').then(m => m.CiApplicationModule) },
      { path: 'Imersao', loadChildren: () => import('@ci-apps/Imersao').then(m => m.CiApplicationModule) },
      { path: 'Infra', loadChildren: () => import('@ci-apps/Infra').then(m => m.CiApplicationModule) },
      { path: 'Instalacao', loadChildren: () => import('@ci-apps/Instalacao').then(m => m.CiApplicationModule) },
      { path: 'LowCode', loadChildren: () => import('@ci-apps/LowCode').then(m => m.CiApplicationModule) },
      { path: 'Mensagens', loadChildren: () => import('@ci-apps/Mensagens').then(m => m.CiApplicationModule) },
      { path: 'Organizacao', loadChildren: () => import('@ci-apps/Organizacao').then(m => m.CiApplicationModule) },
      { path: 'Produtos', loadChildren: () => import('@ci-apps/Produtos').then(m => m.CiApplicationModule) },
      { path: 'Profile', loadChildren: () => import('@ci-apps/Profile').then(m => m.CiApplicationModule) },
      { path: 'Projetos', loadChildren: () => import('@ci-apps/Projetos').then(m => m.CiApplicationModule) },
      { path: 'SEO', loadChildren: () => import('@ci-apps/SEO').then(m => m.CiApplicationModule) },
      { path: 'Threejs', loadChildren: () => import('@ci-apps/Threejs').then(m => m.CiApplicationModule) },
      { path: 'Treinamento', loadChildren: () => import('@ci-apps/Treinamento').then(m => m.CiApplicationModule) },
      { path: 'Vendas', loadChildren: () => import('@ci-apps/Vendas').then(m => m.CiApplicationModule) },
      { path: '**', redirectTo: '/meus-apps', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainelRoutingModule { }
