import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'ci-acessar',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './acessar.component.html',
  styleUrl: './acessar.component.scss'
})
export class AcessarComponent {
  stage?: 'identification' | 'loading' | 'captcha' | 'authentication';
}
