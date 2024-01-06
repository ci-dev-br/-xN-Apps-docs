import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InicioRoutingModule } from './inicio-routing.module';
import { InicioComponent } from './inicio.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    InicioComponent,
  ],
  imports: [
    CommonModule,
    InicioRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ]
})
export class InicioModule { }
