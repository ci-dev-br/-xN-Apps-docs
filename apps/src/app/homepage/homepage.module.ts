import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomepageRoutingModule } from './homepage-routing.module';
import { USER_MENU } from '@ci/auth';
import { ProfileMenu } from '@ci/auth';
import { PainelComponent } from '../painel/painel.component';
import { IItemMenu } from '@ci/components';
import { HomeComponent } from '../../../dist/ci-apps/cadastros/lib/ci-application/home/home.component';
import { HomepageComponent } from './homepage.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomepageRoutingModule,
  ],
  providers: [
    {
      provide: USER_MENU, useValue: [
        {
          component: ProfileMenu,
          /* 
          {{ (user | async)?.fullName || (user | async)?.username}}
          */
          // label: 'Username'
        },
        /* {
          label: 'Minha Conta',
          onClick: (painel?: HomepageComponent) => {
            painel?.profile();
          }
        },
        {
          label: 'Ajustar Visibilidade',
          icon: 'visibility',
          onClick: (painel?: PainelComponent) => {
          }
        },
        {
          label: 'Sair',
          onClick: (painel?: PainelComponent) => {
            painel?.sair();
          }
        }, */
      ] as IItemMenu
    }
  ]
})
export class HomepageModule { }
