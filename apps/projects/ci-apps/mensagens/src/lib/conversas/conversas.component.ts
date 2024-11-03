import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PesquisarService } from '../pesquisar-contato/pesquisar-contato.service';

@Component({
  selector: 'ci-conversas',
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './conversas.component.html',
  styleUrl: './conversas.component.scss'
})
export class ConversasComponent {
  constructor(
    private readonly pesquisar: PesquisarService,
  ) { }
  async pesquisarContato() {
    return await this.pesquisar.pesquisarContato();
  }
}
