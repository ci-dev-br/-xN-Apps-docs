import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@ci/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { DynFormComponent } from './dyn-form.component';
import { FORM_OPTIONS, FormOptionsBuilder, IFormOptions } from './i-form-options';
import { DynInputDateComponent } from './dyn-input/dyn-input-date.component';
import { DynInputComponent } from './dyn-input/dyn-input.component';
@NgModule({
  declarations: [
    DynFormComponent,
    DynInputComponent,
    DynInputDateComponent,
  ],
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  providers: [
    FormOptionsBuilder,
  ],
  exports: [
    DynFormComponent,
    DynInputComponent,
    DynInputDateComponent,
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
export {
  DynFormComponent,
  DynInputComponent,
  DynInputDateComponent,
}
