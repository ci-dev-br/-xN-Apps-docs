import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CadastroComponent } from './cadastro.component';
import { DynamicModule } from '../../dynamic/dynamic.module';



@NgModule({
  declarations: [
    CadastroComponent,
  ],
  imports: [
    CommonModule,
    DynamicModule,
  ],
  exports: [
    CadastroComponent,
  ]
})
export class CadastroModule { }
