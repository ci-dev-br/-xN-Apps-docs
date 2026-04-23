import { NgModule } from '@angular/core';
import { EditarDetailComponent } from './editar-detail.component';
import { CoreModule } from '@ci/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DynFormModule } from '@ci/components/dyn-form';

/**
 * Editar Detail Module
 */
@NgModule({
  declarations: [
    EditarDetailComponent,
  ],
  exports: [
    EditarDetailComponent,
  ],
  imports: [
    CoreModule,
    ReactiveFormsModule,
    DynFormModule,
  ]
})
export class EditarDetailModule { }
export {
  EditarDetailComponent,
}