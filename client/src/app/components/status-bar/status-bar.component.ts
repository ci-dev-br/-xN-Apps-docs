import { Component } from '@angular/core';

@Component({
  selector: 'ci-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent {
  status?: string = 'OK';
}
