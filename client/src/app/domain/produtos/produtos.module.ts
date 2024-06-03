import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProdutosRoutingModule } from './produtos-routing.module';
import { ProdutosComponent } from './produtos.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { WindowModule } from 'src/app/components/window/window.module';
import { MarcaService } from './services/marca.service';
import { GridModule } from 'src/app/components/grid/grid.module';
import { MatCardModule } from '@angular/material/card';
import { CardActionsComponent } from 'src/app/components/card/card-actions.component';
import { CoreModule } from 'src/app/core/core.module';


@NgModule({
  declarations: [
    ProdutosComponent
  ],
  imports: [
    CoreModule,
    WindowModule,
    ProdutosRoutingModule,
    MatButtonModule,
    MatIconModule,
    LNavModule,
    GridModule,
    MatCardModule,
    CardActionsComponent,
  ],
  providers: [
    MarcaService,
  ]
})
export class ProdutosModule { }
