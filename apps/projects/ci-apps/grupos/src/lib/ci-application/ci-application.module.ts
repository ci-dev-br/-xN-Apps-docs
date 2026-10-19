import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { HomeComponent } from './home/home.component';
import { GrupoDetalheComponent } from './grupo-detalhe/grupo-detalhe.component';
import { NovoTopicoDialogComponent } from './dialogs/novo-topico-dialog.component';
import { CompartilharAtivoDialogComponent } from './dialogs/compartilhar-ativo-dialog.component';

@NgModule({
  declarations: [
    HomeComponent,
    GrupoDetalheComponent,
    NovoTopicoDialogComponent,
    CompartilharAtivoDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CiApplicationRoutingModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatSelectModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatBadgeModule
  ]
})
export class CiApplicationModule { }
