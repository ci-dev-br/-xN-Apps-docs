import { NgModule } from '@angular/core';
import { DataListComponent } from './data-list.component';
import { IListOptions } from '../models/i-list-options';
import { IListFieldOptions } from '../models/i-list-field-options';
import { CoreModule } from '@ci/core';
import { ItemRendererComponent } from './item-renderer/item-renderer.component';
@NgModule({
  declarations: [
    DataListComponent
  ],
  imports: [
    CoreModule,
    ItemRendererComponent,
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
  ItemRendererComponent,
}
