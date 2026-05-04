import { NgModule } from '@angular/core';
import { EditarDetailComponent } from './editar-detail.component';
import { CoreModule } from '@ci/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DynFormModule } from '@ci/components/dyn-form';
import { ActionModule } from '@ci/components/action';

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
    ActionModule,
    ReactiveFormsModule,
    DynFormModule,
  ]
})
export class EditarDetailModule { }
export {
  EditarDetailComponent,
}