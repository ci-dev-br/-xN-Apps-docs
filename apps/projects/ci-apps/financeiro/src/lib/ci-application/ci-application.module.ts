import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { MasterDetailModule } from '@ci/components/master-detail';
import { BoardModule } from '@ci/components';
@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    BoardModule,
    MasterDetailModule,
    CiApplicationRoutingModule
  ]
})
export class CiApplicationModule { }
