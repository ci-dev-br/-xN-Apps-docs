import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobFakeModule } from './mob-fake.module';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ci-mob-fake',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
  ],
  templateUrl: './mob-fake.component.html',
  styleUrl: './mob-fake.component.scss'
})
export class MobFakeComponent {
  status: 'off-line' | 'online' | 'conectando' = 'off-line';
  async conectar() {
    if (this.status === 'off-line')
      this.status = 'conectando';
  }
}
