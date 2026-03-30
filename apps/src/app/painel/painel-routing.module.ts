import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelComponent } from './painel.component';
export const routes: Routes = [{
  path: '', component: PainelComponent, children: [
    { path: 'meus-apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule) },
    { path: 'Arquivos', loadChildren: () => import('@ci-apps/Arquivos').then(m => m.CiApplicationModule) },
    { path: 'Codex', loadChildren: () => import('@ci-apps/Codex').then(m => m.CiApplicationModule) },
    { path: 'CMS', loadChildren: () => import('@ci-apps/cms').then(m => m.CiApplicationModule) },
    { path: 'Financeiro', loadChildren: () => import('@ci-apps/Financeiro').then(m => m.CiApplicationModule) },
    { path: 'CRM', loadChildren: () => import('@ci-apps/crm').then(m => m.CiApplicationModule) },
    { path: 'Cadastros', loadChildren: () => import('@ci-apps/Cadastros').then(m => m.CiApplicationModule) },
    { path: 'DevTools', loadChildren: () => import('@ci-apps/DevTools').then(m => m.CiApplicationModule) },
    { path: 'Dynamic', loadChildren: () => import('@ci-apps/Dynamic').then(m => m.CiApplicationModule) },
    { path: 'LowCode', loadChildren: () => import('@ci-apps/LowCode').then(m => m.CiApplicationModule) },
    { path: 'Organizacao', loadChildren: () => import('@ci-apps/Organizacao').then(m => m.CiApplicationModule) },

  ]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainelRoutingModule { }