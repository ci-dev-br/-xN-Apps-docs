import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PesquisarService } from '../pesquisar-contato/pesquisar-contato.service';
import { TorusGeometry } from 'three';
import { ReactiveFormsModule } from '@angular/forms';
import { ChamadaService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'ci-conversas',
  imports: [
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  templateUrl: './conversas.component.html',
  styleUrl: './conversas.component.scss'
})
export class ConversasComponent {
  constructor(
    private readonly pesquisar: PesquisarService,
    private readonly chamada: ChamadaService,
  ) { }
  async pesquisarContato() {
    return await this.pesquisar.pesquisarContato();
  }
  async iniciarChamada() {
    await lastValueFrom(this.chamada.nova());
  }
}
