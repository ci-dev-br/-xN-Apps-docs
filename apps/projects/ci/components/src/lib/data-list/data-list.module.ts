import { NgModule } from '@angular/core';
import { DataListComponent } from './data-list.component';
import { IListOptions } from '../models/i-list-options';
import { IListFieldOptions } from '../models/i-list-field-options';
import { CoreModule } from '@ci/core';
@NgModule({
  declarations: [
    DataListComponent
  ],
  imports: [
    CoreModule,
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
