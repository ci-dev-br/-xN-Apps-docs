import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EditarDetailComponent } from './editar-detail.component';
import { CoreModule } from '@ci/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DynFormModule } from '@ci/components/dyn-form';
import { ActionModule } from '@ci/components/action';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    CommonModule,
    CoreModule,
    ActionModule,
    ReactiveFormsModule,
    DynFormModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ]
})
export class EditarDetailModule { }
export {
  EditarDetailComponent,
}