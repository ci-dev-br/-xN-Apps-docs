import { inject, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PainelRoutingModule } from './painel-routing.module';
import { USER_MENU } from '@ci/auth';
import { IItemMenu } from '@ci/components';
import { PainelComponent } from './painel.component';
import { ProfileMenu } from '../../../projects/ci/auth/src/lib/components/profile-menu/profile-menu';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PainelRoutingModule
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
        {
          label: 'Minha Conta',
          onClick: (painel?: PainelComponent) => {
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
        },
      ] as IItemMenu
    }
  ]
})
export class PainelModule { }
