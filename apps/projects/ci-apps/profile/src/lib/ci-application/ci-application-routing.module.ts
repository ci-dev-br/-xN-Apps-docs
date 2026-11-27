import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Meu Perfil',
    data: {
      appName: 'Profile',
      icon: 'account_box',
      group: 'user-menu',
      navbar: {
        id: 'profile-home',
        slot: 'user-menu',
        label: 'Meu Perfil',
        icon: 'account_box',
        order: 10,
      },
    },
  },
  {
    path: 'seguranca',
    component: HomeComponent,
    title: 'Segurança',
    data: {
      appName: 'Profile',
      icon: 'security',
      group: 'user-menu',
      navbar: {
        id: 'profile-seguranca',
        slot: 'user-menu',
        label: 'Segurança',
        icon: 'security',
        order: 20,
      },
    },
  },
  {
    path: 'settings',
    component: HomeComponent,
    title: 'Configurações',
    data: {
      appName: 'Profile',
      icon: 'settings',
      group: 'user-menu',
      navbar: {
        id: 'profile-settings',
        slot: 'user-menu',
        label: 'Configurações',
        icon: 'settings',
        order: 30,
      },
    },
  },
  {
    path: 'confirmar-email',
    component: HomeComponent,
    title: 'Confirmar E-mail',
  },
  {
    path: 'confirmar-email/:token',
    component: HomeComponent,
    title: 'Confirmar E-mail',
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CiApplicationRoutingModule { }
