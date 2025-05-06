import { Component, OnDestroy, OnInit } from '@angular/core';
import { BoardModule } from '@ci/components';

@Component({
  selector: 'ci-crm',
  standalone: true,
  imports: [
    BoardModule,
  ],
  template: `
    <ci-board default="Apps.CRM" ></ci-board>
  `,
  styleUrls: ['crm.component.scss']
})
export class CrmComponent implements OnInit, OnDestroy {
  private t = document.title;
  ngOnInit(): void {
    document.title = `${this.t} :: CRM`;
  }
  ngOnDestroy(): void {
    document.title = this.t;
  }
}
