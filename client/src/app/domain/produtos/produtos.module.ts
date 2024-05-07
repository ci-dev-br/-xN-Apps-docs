import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProdutosRoutingModule } from './produtos-routing.module';
import { ProdutosComponent } from './produtos.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { WindowModule } from 'src/app/components/window/window.module';
import { MarcaService } from './services/marca.service';


@NgModule({
  declarations: [
    ProdutosComponent
  ],
  imports: [
    CommonModule,
    WindowModule,
    ProdutosRoutingModule,
    MatButtonModule,
    MatIconModule,
    LNavModule,
  ],
  providers: [
    MarcaService,
  ]
})
export class ProdutosModule { }
