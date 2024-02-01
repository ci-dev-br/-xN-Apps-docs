import { NgModule } from '@angular/core';
import { JanelaComponent } from './janela.component';
import { JanelaService } from './janela.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CoreModule } from 'src/app/core/core.module';

@NgModule({
  declarations: [
    JanelaComponent
  ],
  imports: [
    CoreModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  providers: [
    JanelaService,
  ],
  exports: [
    JanelaComponent,
  ]
})
export class JanelaModule { }
