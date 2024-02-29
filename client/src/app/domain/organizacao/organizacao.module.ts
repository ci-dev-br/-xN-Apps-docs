import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizacaoRoutingModule } from './organizacao-routing.module';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCardModule,
    OrganizacaoRoutingModule
  ]
})
export class OrganizacaoModule { }
