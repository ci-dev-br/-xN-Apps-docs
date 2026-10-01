import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { MessageService } from '@ci/portal-api';
import { MatDialogModule } from '@angular/material/dialog';
import { PesquisarService } from './views/pesquisar-contato/pesquisar-contato.service';

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
