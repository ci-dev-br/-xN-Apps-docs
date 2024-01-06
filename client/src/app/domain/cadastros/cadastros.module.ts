import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadastrosRoutingModule } from './cadastros-routing.module';
import { CadastrosComponent } from './cadastros.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';


@NgModule({
  declarations: [
    CadastrosComponent
  ],
  imports: [
    CommonModule,
    CadastrosRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
  ]
})
export class CadastrosModule { }
