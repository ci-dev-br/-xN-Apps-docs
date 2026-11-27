import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';
import { DataGridModule } from '@ci/components/data-grid';
import { WindowModule } from '@ci/components/window';
import { CoreModule } from '@ci/core';
import { models } from '../models';

@Component({
  selector: 'ci-seo',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
    DataGridModule,
    BoardModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    WindowModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './seo.component.html',
  styleUrl: './seo.component.scss',
})
export class SeoComponent implements OnInit, OnDestroy {
  entidades = models;
  private previousTitle?: string;

  ngOnInit(): void {
    this.previousTitle = document.title;
    document.title = 'SEO & Marketing :: Portal';
  }

  ngOnDestroy(): void {
    if (this.previousTitle) {
      document.title = this.previousTitle;
    }
  }
}
