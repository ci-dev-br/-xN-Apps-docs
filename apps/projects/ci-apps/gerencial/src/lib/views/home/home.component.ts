import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IconModule } from '@ci/components';

@Component({
  selector: 'ci-home',
  imports: [
    IconModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

}
