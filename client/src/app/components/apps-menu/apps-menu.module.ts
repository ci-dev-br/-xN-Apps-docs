import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppsMenuRoutingModule } from './apps-menu-routing.module';
import { AppsMenuComponent } from './apps-menu.component';


@NgModule({
  declarations: [
    AppsMenuComponent
  ],
  imports: [
    CommonModule,
    AppsMenuRoutingModule
  ]
})
export class AppsMenuModule { }
