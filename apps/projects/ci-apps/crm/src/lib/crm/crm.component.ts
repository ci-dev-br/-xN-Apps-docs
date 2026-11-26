import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { models } from '../models';

@Component({
  selector: 'ci-crm',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
    BoardModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: 'crm.component.html',
  styleUrls: ['crm.component.scss']
})
export class CrmComponent implements OnInit, OnDestroy {
  cadastros = models;
  private t?: string;

  ngOnInit(): void {
    this.t = document.title;
    document.title = `CRM & Vendas :: Portal`;
  }

  ngOnDestroy(): void {
    if (this.t) document.title = this.t;
  }
}
