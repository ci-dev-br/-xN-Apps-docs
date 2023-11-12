import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CadastrosRoutingModule } from './cadastros-routing.module';
import { CadastrosComponent } from './cadastros.component';


@NgModule({
  declarations: [
    CadastrosComponent
  ],
  imports: [
    CommonModule,
    CadastrosRoutingModule
  ]
})
export class CadastrosModule { }
