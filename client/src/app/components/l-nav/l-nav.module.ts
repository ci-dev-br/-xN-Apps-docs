import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LNavComponent } from './l-nav.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    LNavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ],
  exports: [
    LNavComponent
  ]
})
export class LNavModule { }
