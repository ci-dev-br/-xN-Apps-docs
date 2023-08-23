import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AcessarRoutingModule } from './acessar-routing.module';
import { AcessarComponent } from './acessar.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AcessarComponent
  ],
  imports: [
    CommonModule,
    AcessarRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ]
})
export class AcessarModule { }
