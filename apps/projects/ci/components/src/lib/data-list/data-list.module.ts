import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataListComponent } from './data-list.component';



@NgModule({
  declarations: [
    DataListComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DataListComponent
  ]
})
export class DataListModule { }
