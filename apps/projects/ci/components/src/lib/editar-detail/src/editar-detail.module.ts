import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditarDetailComponent } from './editar-detail.component';

/**
 * Editar Detail Module
 */
@NgModule({
  declarations: [

  ],
  exports: [
    EditarDetailComponent,
  ],
  imports: [
    CommonModule,
    EditarDetailComponent,
  ]
})
export class EditarDetailModule { }
export {
  EditarDetailComponent,
}