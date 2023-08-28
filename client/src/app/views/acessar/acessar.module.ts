import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AcessarRoutingModule } from './acessar-routing.module';
import { AcessarComponent } from './acessar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { CoreModule } from 'src/app/core/core.module';
import { LFooterModule } from 'src/app/components/l-footer/l-footer.module';


@NgModule({
  declarations: [
    AcessarComponent
  ],
  imports: [
    CoreModule,
    FormsModule,
    AcessarRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    LNavModule,
    LFooterModule,
  ]
})
export class AcessarModule { }
