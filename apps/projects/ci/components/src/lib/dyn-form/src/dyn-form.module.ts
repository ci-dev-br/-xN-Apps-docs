import { ModuleWithProviders, NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@ci/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DynFormComponent } from './dyn-form.component';
import { FORM_OPTIONS, FormOptionsBuilder, IFormOptions } from './i-form-options';
import { DynInputDateComponent } from './dyn-input/dyn-input-date.component';
import { DynInputComponent } from './dyn-input/dyn-input.component';
import { DynInputModulesComponent } from './dyn-input/dyn-input-modules.component';
import { NgxCurrencyDirective } from 'ngx-currency';

@NgModule({
  declarations: [
    DynFormComponent,
    DynInputComponent,
    DynInputDateComponent,
    DynInputModulesComponent,
  ],
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatTooltipModule,
    NgxCurrencyDirective,
  ],
  providers: [
    FormOptionsBuilder,
  ],
  exports: [
    DynFormComponent,
    DynInputComponent,
    DynInputDateComponent,
    DynInputModulesComponent,
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
  DynInputModulesComponent,
}
