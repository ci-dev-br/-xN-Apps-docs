import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button'

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor() { }
  importFromFile() {
    
  }
}
