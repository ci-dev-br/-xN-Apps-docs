import { inject, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PainelRoutingModule } from './painel-routing.module';
import { USER_MENU } from '@ci/auth';
import { IItemMenu } from '@ci/components';
import { PainelComponent } from './painel.component';
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
          /* 
          {{ (user | async)?.fullName || (user | async)?.username}}
          */
          label: 'Username'
        },
        {
          label: 'Profile',
          onClick: (painel?: PainelComponent) => {
            painel?.profile();
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
