import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfraRoutingModule } from './infra-routing.module';
import { InfraService } from './services/infra.service';
import { WindowModule } from 'src/app/components/window/window.module';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InfraRoutingModule,
    WindowModule,
  ],
  providers: [
    InfraService,
  ]
})
export class InfraModule { }
