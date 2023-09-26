import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JanelaComponent } from './janela.component';
import { JanelaService } from './janela.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    JanelaComponent
  ],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
  ],
  providers: [
    JanelaService,
  ],
  exports: [
    JanelaComponent,
  ]
})
export class JanelaModule { }
