import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { PesquisarService } from '../pesquisar-contato/pesquisar-contato.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Conversation } from '@ci/portal-api';
import { MessagerService } from '../mensagens.service';

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

    private readonly messager: MessagerService,
  ) {
    this.carregarConversas();
  }
  async pesquisarContato() {
    return await this.pesquisar.pesquisarContato();
  }
  async iniciarChamada() {
    return this.messager.iniciarChamada();
  }
  async carregarConversas() {
    this.conversas = await this.messager.carregarConversas();
  }
}
