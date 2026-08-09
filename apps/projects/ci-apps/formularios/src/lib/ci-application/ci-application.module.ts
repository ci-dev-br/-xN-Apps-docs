import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { AudioProcessorService } from './AudioProcessorService';
@NgModule({
  imports: [
    CommonModule,
    CiApplicationRoutingModule
  ],
  providers: [
    AudioProcessorService,
  ]
})
export class CiApplicationModule { }
