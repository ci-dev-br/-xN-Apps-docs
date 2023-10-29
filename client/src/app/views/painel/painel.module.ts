import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { PainelRoutingModule } from './painel-routing.module';
import { PainelComponent } from './painel.component';
import { CoreModule } from 'src/app/core/core.module';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { InicioComponent } from './inicio/inicio.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WidgetModule } from 'src/app/widgets/widgets.module';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  declarations: [
    PainelComponent,
    InicioComponent,
  ],
  imports: [
    CoreModule,
    PainelRoutingModule,
    LNavModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    // WidgetModule,
    MatMenuModule,
  ]
})
export class PainelModule { }
