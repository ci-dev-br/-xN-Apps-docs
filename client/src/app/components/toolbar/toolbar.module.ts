import { NgModule } from '@angular/core';
import { ToolbarComponent } from './toolbar.component';
import { CoreModule } from 'src/app/core/core.module';
import { MatButtonModule } from '@angular/material/button';
import { ToolbarService } from './toolbar.service';


@NgModule({
  declarations: [
    ToolbarComponent,
  ],
  imports: [
    CoreModule,
    MatButtonModule,
  ],
  exports: [
    ToolbarComponent,
  ],
  providers: [
    ToolbarService,
  ]
})
export class ToolbarModule { }
