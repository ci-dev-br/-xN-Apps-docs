import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ContainerModule } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CoreModule,
    ContainerModule,
    MatButtonModule,
    MatToolbarModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
