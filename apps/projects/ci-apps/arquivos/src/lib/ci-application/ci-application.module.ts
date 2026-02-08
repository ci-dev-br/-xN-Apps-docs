import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { FilesComponent } from './files/files.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CiApplicationRoutingModule
  ]
})
export class CiApplicationModule { }
export {
  FilesComponent
}