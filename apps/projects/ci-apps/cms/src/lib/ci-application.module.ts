import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { MasterDetailModule } from '@ci/components/master-detail';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MasterDetailModule,
    CiApplicationRoutingModule
  ]
})
export class CiApplicationModule { }
