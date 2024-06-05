import { Component } from '@angular/core';

@Component({
  selector: 'ci-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['../../../scss/landingpage.scss']
})
export class HomepageComponent {
  vibrate?: string = '';

  vibrar() {
    navigator.vibrate(JSON.parse(String(this.vibrate)))
  }
}
