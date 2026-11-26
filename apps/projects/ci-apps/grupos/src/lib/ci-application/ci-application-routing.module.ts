import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GruposModalComponent } from '@ci/components';
import { HomeComponent } from './home/home.component';
import { GrupoDetalheComponent } from './grupo-detalhe/grupo-detalhe.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Grupos e Comunidades',
    data: {
      appName: 'Grupos',
      title: 'Grupos e Comunidades',
      icon: 'groups',
      navbar: {
        id: 'grupos-comunidades',
        slot: 'end',
        icon: 'groups',
        tooltip: 'Grupos e Comunidades',
        roles: ['USER', 'ADMIN', 'MASTER'],
        order: 20,
        children: [
          {
            id: 'grupos-encontrar',
            label: 'Encontrar grupos',
            icon: 'search',
            dialogComponent: GruposModalComponent,
            dialogData: { initialTab: 0 },
            dialogConfig: { panelClass: 'ci-grupos-dialog-panel' },
          },
          {
            id: 'grupos-criar',
            label: 'Criar novo grupo',
            icon: 'group_add',
            dialogComponent: GruposModalComponent,
            dialogData: { initialTab: 1 },
            dialogConfig: { panelClass: 'ci-grupos-dialog-panel' },
          },
          {
            id: 'grupos-meus',
            label: 'Meus grupos',
            icon: 'diversity_3',
            dialogComponent: GruposModalComponent,
            dialogData: { initialTab: 2 },
            dialogConfig: { panelClass: 'ci-grupos-dialog-panel' },
          },
          {
            id: 'grupos-abrir-pagina',
            label: 'Abrir Grupos',
            icon: 'open_in_new',
            routerLink: '/Grupos',
          },
        ],
      },
    },
  },
  {
    path: ':id',
    component: GrupoDetalheComponent,
    title: 'Comunidade'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
