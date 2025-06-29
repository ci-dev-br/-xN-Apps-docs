import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PesquisarService } from '../pesquisar-contato/pesquisar-contato.service';
import { ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ChamadaService, Conversation, ConversationService } from '@ci/portal-api';

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
  conversas?: Conversation[];
  constructor(
    private readonly pesquisar: PesquisarService,
    private readonly chamada: ChamadaService,
    private readonly conversations: ConversationService,
  ) {
    this.carregarConversas();
  }
  async pesquisarContato() {
    return await this.pesquisar.pesquisarContato();
  }
  async iniciarChamada() {
    await lastValueFrom(this.chamada.nova());
  }
  async carregarConversas() {
    this.conversas = await lastValueFrom(this.conversations.getList());
  }
}
