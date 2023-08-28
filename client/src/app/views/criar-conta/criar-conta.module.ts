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
import { CoreModule } from 'src/app/core/core.module';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';


@NgModule({
  declarations: [
    CriarContaComponent
  ],
  imports: [
    CoreModule,
    CriarContaRoutingModule,
    AcessarRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    LNavModule,
  ]
})
export class CriarContaModule { }
