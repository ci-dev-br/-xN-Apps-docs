import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfraRoutingModule } from './infra-routing.module';
import { InfraService } from './services/infra.service';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InfraRoutingModule
  ],
  providers: [
    InfraService,
  ]
})
export class InfraModule { }
