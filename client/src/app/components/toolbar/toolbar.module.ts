import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './toolbar.component';
import { CoreModule } from 'src/app/core/core.module';
import { MatButtonModule } from '@angular/material/button';



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
  ]
})
export class ToolbarModule { }
