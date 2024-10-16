import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button'
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor() { }
  importFromFile() {
    
  }
}
