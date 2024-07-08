import { Component } from '@angular/core';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-logo',
  standalone: true,
  imports: [
    CoreModule,
  ],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss'
})
export class LogoComponent {
}
