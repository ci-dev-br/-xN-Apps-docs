import { Component, Input } from '@angular/core';

@Component({
  selector: 'ci-data-grid',
  standalone: true,
  imports: [],
  template: `
    <p>
      data-grid works!
    </p>
  `,
  styles: ``
})
export class DataGridComponent {
  @Input()
  options?: any;
}
