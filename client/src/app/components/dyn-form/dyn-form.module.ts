import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynFormComponent } from './dyn-form.component';
import { FORM_OPTIONS, IFormOptions } from './i-form-options';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    DynFormComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
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
