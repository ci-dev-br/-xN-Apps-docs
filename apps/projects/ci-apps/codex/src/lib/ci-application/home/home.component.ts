import { Component } from '@angular/core';

@Component({
  selector: 'ci-home',
  standalone: true,
  imports: [
    
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  items = [
    { titulo: "Criar novo Módulo" },
    { titulo: "Inspecionar Módulo" },
  ]
}
