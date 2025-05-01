import { Component } from '@angular/core';
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
export class CrmComponent {

}
