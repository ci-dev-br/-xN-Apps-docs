import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { MessageService } from '@ci/portal-api';
import { PesquisarService } from '../pesquisar-contato/pesquisar-contato.service';
import { MatDialogModule } from '@angular/material/dialog';
import { PesquisarContatoComponent } from '../pesquisar-contato/pesquisar-contato.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CiApplicationRoutingModule,
    MatDialogModule,
  ],
  providers: [
    MessageService,
    PesquisarService,
  ]
})
export class CiApplicationModule { }
