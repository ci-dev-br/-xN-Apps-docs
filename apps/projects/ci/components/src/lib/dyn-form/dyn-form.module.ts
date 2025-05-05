import { ModuleWithProviders, NgModule } from '@angular/core';
import { DynFormComponent } from './dyn-form.component';
import { FORM_OPTIONS, FormOptionsBuilder, IFormOptions } from './i-form-options';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@ci/core';
import { MatChipsModule } from '@angular/material/chips';
@NgModule({
  declarations: [
    DynFormComponent
  ],
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatChipsModule,
  ],
  providers: [
    FormOptionsBuilder,
  ],
  exports: [
    DynFormComponent,
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
}
