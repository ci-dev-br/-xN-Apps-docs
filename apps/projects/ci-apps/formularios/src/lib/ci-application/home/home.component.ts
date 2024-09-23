import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FileComponent } from '@ci/components';
import { CoreModule } from '@ci/core';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    CoreModule,
    MatToolbarModule,
    FileComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
