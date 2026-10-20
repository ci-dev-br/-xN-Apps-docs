import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@ci/core';
import { MasterDetailModule } from '@ci/components/master-detail';
import { DataGridModule } from '@ci/components/data-grid';
import { WindowModule } from '@ci/components/window';

import { CiApplicationRoutingModule } from './ci-application-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CoreModule,
    DataGridModule,
    MasterDetailModule,
    WindowModule,
    CiApplicationRoutingModule
  ]
})
export class CiApplicationModule { }
