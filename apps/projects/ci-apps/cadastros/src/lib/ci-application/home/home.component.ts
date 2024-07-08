import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CoreModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
