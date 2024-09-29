import { NgModule } from '@angular/core';
import { ActionComponent } from './action.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CoreModule } from '@ci/core';

@NgModule({
  declarations: [
    ActionComponent
  ],
  imports: [
    CoreModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    ActionComponent
  ]
})
export class ActionModule { }
export{
  ActionComponent
}
