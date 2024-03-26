import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LNavComponent } from './l-nav.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  declarations: [
    LNavComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    NgxChartsModule,
  ],
  exports: [
    LNavComponent
  ]
})
export class LNavModule { }
