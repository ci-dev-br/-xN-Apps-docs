import { Component } from '@angular/core';
import { ConversasComponent } from '../../conversas/conversas.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    ConversasComponent,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
