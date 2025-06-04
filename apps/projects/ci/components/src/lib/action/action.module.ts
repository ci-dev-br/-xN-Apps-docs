import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { CoreModule } from '@ci/core';

import { ActionComponent } from './action.component';
import { ActionsComponent } from './actions.component';
import { ActionsService } from './actions.service';

@NgModule({
  declarations: [
    ActionComponent,
    ActionsComponent,
  ],
  imports: [
    CoreModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    ActionComponent,
    ActionsComponent,
  ],
  providers: [
    ActionsService,
  ]
})
export class ActionModule { }
export {
  ActionComponent,
  ActionsComponent,
}
