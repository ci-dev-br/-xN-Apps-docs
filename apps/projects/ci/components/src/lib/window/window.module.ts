import { NgModule } from '@angular/core';
import { WindowComponent } from './window.component';
import { WindowService } from './window.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CoreModule } from '@ci/core';
import { IWindowData, IMenuItem } from './models';

@NgModule({
  declarations: [
    WindowComponent,
  ],
  imports: [
    CoreModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  providers: [
    WindowService,
  ],
  exports: [
    WindowComponent,
  ]
})
export class WindowModule { }
export {
  WindowComponent,
  WindowService,
  IWindowData as IData,
  IMenuItem as IItemMenu,
}
