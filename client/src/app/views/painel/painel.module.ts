import { NgModule } from '@angular/core';

import { PainelRoutingModule } from './painel-routing.module';
import { PainelComponent } from './painel.component';
import { CoreModule } from 'src/app/core/core.module';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';

@NgModule({
  declarations: [
    PainelComponent
  ],
  imports: [
    CoreModule,
    PainelRoutingModule,
    LNavModule,
  ]
})
export class PainelModule { }
