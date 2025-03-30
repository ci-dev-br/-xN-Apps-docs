import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BoardRoutingModule } from './board-routing.module';
import { BoardComponent } from './board.component';
import { MatToolbarModule } from '@angular/material/toolbar';


@NgModule({
  declarations: [
    BoardComponent
  ],
  imports: [
    CommonModule,
    BoardRoutingModule,
    MatToolbarModule,
  ],
  exports: [
    BoardComponent
  ]
})
export class BoardModule { }
