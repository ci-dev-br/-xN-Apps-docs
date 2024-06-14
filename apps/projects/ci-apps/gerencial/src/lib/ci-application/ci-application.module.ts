import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { AuthModule } from '@ci/auth';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AuthModule,
    CiApplicationRoutingModule
  ]
})
export class CiApplicationModule { }
