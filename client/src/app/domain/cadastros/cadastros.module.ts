import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadastrosRoutingModule } from './cadastros-routing.module';
import { CadastrosComponent } from './cadastros.component';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    CadastrosComponent
  ],
  imports: [
    CommonModule,
    CadastrosRoutingModule,
    MatButtonModule,
  ]
})
export class CadastrosModule { }
