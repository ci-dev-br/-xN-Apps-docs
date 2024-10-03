import { NgModule } from '@angular/core';
import { EditRoutingModule } from './edit-routing.module';
import { EditComponent } from './edit.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { InputModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
@NgModule({
  declarations: [
    EditComponent
  ],
  imports: [
    CoreModule,
    EditRoutingModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatTabsModule,
    InputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
})
export class EditModule { }
