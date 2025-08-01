import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChamadaService, Conversation, ConversationService } from '@ci/portal-api';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MessagerService {
  constructor(
    private readonly dialog: MatDialog,
    public readonly conversations: ConversationService,
    private readonly chamada: ChamadaService,

  ) { }

  async iniciarChamada() {
    return await lastValueFrom(this.chamada.nova());
  }

  async inciarConversa(conversation?: Conversation) {
    if (!conversation?.internalId) {

    } else {

    }

  }
  async carregarConversas() {
    return await lastValueFrom(this.conversations.getList());
  }
}
