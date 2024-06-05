import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynFormComponent } from './dyn-form.component';
import { FORM_OPTIONS, FormOptionsBuilder, IFormOptions } from './i-form-options';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    DynFormComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  providers: [
    FormOptionsBuilder,
  ],
  exports: [
    DynFormComponent
  ]
})
export class DynFormModule {
  public static forForm(form: IFormOptions): ModuleWithProviders<DynFormModule> {
    return {
      ngModule: DynFormModule,
      providers: [
        { provide: FORM_OPTIONS, useValue: form },
      ]
    }
  }
}
