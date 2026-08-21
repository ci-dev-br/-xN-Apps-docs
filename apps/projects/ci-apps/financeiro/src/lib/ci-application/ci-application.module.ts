import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiApplicationRoutingModule } from './ci-application-routing.module';
import { MasterDetailModule } from '@ci/components/master-detail';
import { BoardModule } from '@ci/components';
import { LancamentoFinanceiroService } from '@ci/portal-api';
@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    BoardModule.forFeature({
      services: [{
        scheme: 'LancamentoFinanceiro',
        service: LancamentoFinanceiroService,
      }]
    }),
    MasterDetailModule,
    CiApplicationRoutingModule
  ]
})
export class CiApplicationModule { }
