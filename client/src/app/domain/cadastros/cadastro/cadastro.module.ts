import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CadastroComponent } from './cadastro.component';
import { DinamicModule } from '../../dinamic/dinamic.module';



@NgModule({
  declarations: [
    CadastroComponent,
  ],
  imports: [
    CommonModule,
    DinamicModule,
  ],
  exports: [
    CadastroComponent,
  ]
})
export class CadastroModule { }
