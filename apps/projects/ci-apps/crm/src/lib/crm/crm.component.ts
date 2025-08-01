import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
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
  ],
  templateUrl: 'crm.component.html',
  styleUrls: ['crm.component.scss']
})
export class CrmComponent implements OnInit, OnDestroy {
  cadastros = models;
  private t?: string;
  ngOnInit(): void {
    document.title = `${this.t} :: CRM`;
  }
  ngOnDestroy(): void {
    if (this.t) document.title = this.t;
  }
}
