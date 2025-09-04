import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { Files } from './services/files.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CiApplicationRoutingModule
  ],
  providers: [
    Files,
  ]
})
export class CiApplicationModule { }
