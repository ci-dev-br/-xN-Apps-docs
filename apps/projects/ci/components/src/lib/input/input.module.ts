import { NgModule } from '@angular/core';
import { InputComponent } from './input.component';
import { CoreModule } from '@ci/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
  declarations: [
    InputComponent
  ],
  imports: [
    CoreModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
  exports: [
    InputComponent,
  ]
})
export class InputModule { }
