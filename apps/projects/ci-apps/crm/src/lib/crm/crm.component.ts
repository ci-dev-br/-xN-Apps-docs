import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { BoardModule } from '@ci/components';
import { CoreModule } from '@ci/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'ci-crm',
  standalone: true,
  imports: [
    RouterModule,
    CoreModule,
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
  cadastros = [
    'Agendamento',
    'Atendimento',
    'ClienteCrm',
    'HistoricoContato',
    'Produto',
    'Profissional',
    'Promocao',
    'Servico',
    'VendaProduto',
  ]
  private t = document.title;
  ngOnInit(): void {
    document.title = `${this.t} :: CRM`;
  }
  ngOnDestroy(): void {
    document.title = this.t;
  }
}
