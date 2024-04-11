import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynFormComponent } from './dyn-form.component';
import { FORM_OPTIONS, IFormOptions } from './i-form-options';



@NgModule({
  declarations: [
    DynFormComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DynFormComponent
  ]
})
export class DynFormModule {
  public static forForm(forms: IFormOptions[]): ModuleWithProviders<DynFormModule> {
    return {
      ngModule: DynFormModule,
      providers: [
        { provide: FORM_OPTIONS, useValue: forms },
      ]
    }
  }
}
