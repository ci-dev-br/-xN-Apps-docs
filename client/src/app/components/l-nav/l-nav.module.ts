import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LNavComponent } from './l-nav.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    LNavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [
    LNavComponent
  ]
})
export class LNavModule { }
