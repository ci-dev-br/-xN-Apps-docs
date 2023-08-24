import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CriarContaRoutingModule } from './criar-conta-routing.module';
import { CriarContaComponent } from './criar-conta.component';
import { AcessarRoutingModule } from '../acessar/acessar-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    CriarContaComponent
  ],
  imports: [
    CommonModule,
    CriarContaRoutingModule,
    AcessarRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ]
})
export class CriarContaModule { }
