import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataListComponent } from './data-list.component';
import { IListOptions } from '../models/i-list-options';
import { IListFieldOptions } from '../models/i-list-field-options';
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
export {
  DataListComponent,
  IListOptions,
  IListFieldOptions,
}
