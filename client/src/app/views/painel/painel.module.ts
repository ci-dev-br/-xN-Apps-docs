import { NgModule } from '@angular/core';

import { PainelRoutingModule } from './painel-routing.module';
import { PainelComponent } from './painel.component';
import { CoreModule } from 'src/app/core/core.module';


@NgModule({
  declarations: [
    PainelComponent
  ],
  imports: [
    CoreModule,
    PainelRoutingModule
  ]
})
export class PainelModule { }
