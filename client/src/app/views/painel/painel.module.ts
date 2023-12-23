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
import { MatMenuModule } from '@angular/material/menu';
import { AdicionarWidgetComponent } from './inicio/adicionar-widget/adicionar-widget.component';
import { JanelaModule } from 'src/app/components/janela/janela.module';
import { LayoutComponent } from './inicio/layout/layout.component';
import { LayoutThumbComponent } from './inicio/layout/layout-thumb/layout-thumb.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PainelComponent,
    InicioComponent,
    AdicionarWidgetComponent,
    LayoutComponent,
    LayoutThumbComponent,
  ],
  imports: [
    CoreModule,
    PainelRoutingModule,
    LNavModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    JanelaModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    ReactiveFormsModule,
  ]
})
export class PainelModule { }
