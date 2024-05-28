import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeoRoutingModule } from './seo-routing.module';
import { SeoComponent } from './seo.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LNavModule } from 'src/app/components/l-nav/l-nav.module';
import { WindowModule } from 'src/app/components/window/window.module';
// import { MarcaService } from './services/marca.service';
import { GridModule } from 'src/app/components/grid/grid.module';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    SeoComponent,
  ],
  imports: [
    CommonModule,
    WindowModule,
    SeoRoutingModule,
    MatButtonModule,
    MatIconModule,
    LNavModule,
    GridModule,
    MatCardModule,
  ],
  providers: [
    // MarcaService,
  ]
})
export class SeoModule { }
