import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelComponent } from './painel.component';
export const routes: Routes = [{
  path: '', component: PainelComponent, children: [
    { path: 'meus-apps', loadChildren: () => import('./apps/apps.module').then(m => m.AppsModule) },
    { path: 'Arquivos', loadChildren: () => import('@ci-apps/Arquivos').then(m => m.CiApplicationModule) },
    { path: 'CMS', loadChildren: () => import('@ci-apps/cms').then(m => m.CiApplicationModule) }
  ]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PainelRoutingModule { }