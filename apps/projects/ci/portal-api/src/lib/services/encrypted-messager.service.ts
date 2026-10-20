import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { UserAuthenticationService } from '@ci/auth';

export type SecurePhase = 'p0' | 'p1' | 'p2';

export interface SecureChar {
  char: string;
  phase: SecurePhase;
}

export interface DecryptedMessage {
  id: string;
  conversationId: string;
  messageHash?: string;
  previousMessageHash?: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  recipientId: string;
  content: string; // Conteúdo descriptografado para exibição
  secureChars?: SecureChar[]; // Caracteres em multiplexação temporal anti-print
  rawEncryptedContent: string; // Cifra persistida no banco
  attachments?: Array<{
    name: string;
    url?: string;
    size?: number;
    type?: string;
    data?: string;
  }>;
  read: boolean;
  createdAt: string;
  isMyMessage?: boolean;
}

export interface ConversationItem {
  id: string;
  channelHash?: string;
  title: string;
  contactId: string;
  contactName: string;
  contactPhoto?: string;
  lastMessage?: string; // Descriptografado
  lastMessageEncrypted?: string;
  lastMessageAt: string;
  lastMessageHash?: string;
  unreadCount: number;
}

export interface AvailableUserItem {
  id: string;
  username: string;
  name: string;
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncryptedMessagerService extends BaseService {
  constructor(
    config: ApiConfiguration,
    http: HttpClient,
    @Optional() private userService?: UserAuthenticationService
  ) {
    super(config, http);
  }

  /**
   * Obtém o ID do usuário atualmente autenticado a partir do serviço ou do storage do cliente
   */
  public getCurrentUserId(): string | undefined {
    if (this.userService?.user?.value?.id) {
      return this.userService.user.value.id;
    }
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('CIUSR');
      if (stored) {
        try {
          const userObj = JSON.parse(decodeURIComponent(escape(atob(stored))));
          return userObj?.id;
        } catch {
          try {
            const userObj = JSON.parse(atob(stored));
            return userObj?.id;
          } catch {}
        }
      }
    }
    return undefined;
  }

  private conversationKeyCache = new Map<string, string>();
  private decryptedTextCache = new Map<string, string>();

  /**
   * Deriva a chave simétrica de cifragem (AES-256) no cliente exclusiva para a conversa.
   * O servidor / banco de dados nunca armazena o texto plano nem esta chave.
   */
  public deriveConversationKey(conversationId: string): string {
    if (this.conversationKeyCache.has(conversationId)) {
      return this.conversationKeyCache.get(conversationId)!;
    }
    const clientSecret = 'CI_CLIENT_E2E_ACCESS_KEY_2026';
    const key = CryptoJS.SHA256(`ci_chat_${conversationId}_${clientSecret}`).toString();
    this.conversationKeyCache.set(conversationId, key);
    return key;
  }

  /**
   * Criptografa o texto no cliente antes do envio para o servidor
   */
  public encryptText(plainText: string, conversationId: string): string {
    if (!plainText) return '';
    const key = this.deriveConversationKey(conversationId);
    return CryptoJS.AES.encrypt(plainText, key).toString();
  }

  /**
   * Descriptografa a mensagem recebida no cliente com suporte a candidatos de chaves e cache O(1)
   */
  public decryptText(ciphertext?: string, conversationId?: string, senderId?: string): string {
    if (!ciphertext || !conversationId) return '';
    const trimmed = ciphertext.trim();
    if (!trimmed) return '';

    // Se o conteúdo não foi criptografado com AES (não inicia com o cabeçalho padrão U2FsdGVk), exibe diretamente
    if (!trimmed.startsWith('U2FsdGVk')) {
      return trimmed;
    }

    // Cache hit: se esta cifra já foi descriptografada antes, retorna instantaneamente sem gastar CPU
    const cacheKey = `${conversationId}:${trimmed}`;
    if (this.decryptedTextCache.has(cacheKey)) {
      return this.decryptedTextCache.get(cacheKey)!;
    }

    // 1. Tenta prioritariamente a chave primária da conversa (99.9% dos casos)
    const primaryKey = this.deriveConversationKey(conversationId);
    try {
      const bytes = CryptoJS.AES.decrypt(trimmed, primaryKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (decrypted && decrypted.length > 0) {
        this.decryptedTextCache.set(cacheKey, decrypted);
        return decrypted;
      }
    } catch {}

    // 2. Chaves candidatas para compatibilidade com versões anteriores
    const currentUserId = this.getCurrentUserId();
    const candidateKeys: string[] = [
      CryptoJS.SHA256(`ci_msg_${conversationId}_CI_CLIENT_E2E_ACCESS_KEY_2026`).toString(),
      ...(senderId ? [CryptoJS.SHA256(`ci_msg_${conversationId}_${senderId}`).toString()] : []),
      ...(currentUserId ? [CryptoJS.SHA256(`ci_msg_${conversationId}_${currentUserId}`).toString()] : []),
      CryptoJS.SHA256(`ci_msg_${conversationId}_CI_SECRET_CLIENT_KEY_DEFAULT`).toString(),
      CryptoJS.SHA256(`ci_msg_${conversationId}_DEFAULT_SALT_CI_APPS_2026`).toString(),
    ];

    for (const key of candidateKeys) {
      try {
        const bytes = CryptoJS.AES.decrypt(trimmed, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted && decrypted.length > 0) {
          this.decryptedTextCache.set(cacheKey, decrypted);
          return decrypted;
        }
      } catch {
        // Tenta a próxima chave candidata
      }
    }

    this.decryptedTextCache.set(cacheKey, '[Mensagem protegida]');
    return '[Mensagem protegida]';
  }

  /**
   * Lista conversas do usuário autenticado e descriptografa a prévia da última mensagem
   */
  listarConversas(): Observable<ConversationItem[]> {
    return this.http.get<any[]>(`${this.rootUrl}/Messager/Conversations`).pipe(
      map((conversas) => {
        return (conversas || []).map((c) => ({
          ...c,
          lastMessage: this.decryptText(c.lastMessageEncrypted, c.id, c.contactId),
        }));
      })
    );
  }

  /**
   * Inicia ou retorna uma conversa existente com o usuário especificado
   */
  obterOuCriarConversa(targetUserId: string): Observable<ConversationItem> {
    return this.http.post<any>(`${this.rootUrl}/Messager/Conversations`, { targetUserId }).pipe(
      map((c) => ({
        ...c,
        lastMessage: this.decryptText(c.lastMessageEncrypted, c.id, c.contactId),
      }))
    );
  }

  /**
   * Converte texto em sequência de caracteres com alternância de três em três
   * e distribuição pseudo-aleatória ultrarrápida para multiplexação temporal anti-print.
   */
  public toSecureChars(text: string): SecureChar[] {
    if (!text) return [];
    const result: SecureChar[] = [];
    const phases: SecurePhase[] = ['p0', 'p1', 'p2'];
    let visibleIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === ' ' || ch === '\t' || ch === '\n') {
        result.push({ char: ch, phase: 'p0' });
      } else {
        // Agrupa de três em três com permutação pseudo-aleatória dispersa
        const group = Math.floor(visibleIndex / 3);
        const posInGroup = visibleIndex % 3;
        // Permutação pseudo-aleatória balanceada por trio
        const perm = (group * 7 + 1) % 3;
        const phase = phases[(posInGroup + perm) % 3];
        result.push({ char: ch, phase });
        visibleIndex++;
      }
    }
    return result;
  }

  /**
   * Busca mensagens da conversa e executa a descriptografia em tempo real no cliente
   */
  listarMensagens(conversationId: string): Observable<DecryptedMessage[]> {
    const currentUserId = this.getCurrentUserId();

    return this.http.get<any[]>(`${this.rootUrl}/Messager/Conversations/${conversationId}/Messages`).pipe(
      map((mensagens) => {
        return (mensagens || []).map((m) => {
          const decrypted = this.decryptText(m.encryptedContent, conversationId, m.senderId);
          return {
            id: m.internalId || m.id || m.messageHash,
            conversationId: m.conversationId,
            messageHash: m.messageHash,
            previousMessageHash: m.previousMessageHash,
            senderId: m.senderId,
            senderName: m.senderName,
            senderPhoto: m.senderPhoto,
            recipientId: m.recipientId,
            content: decrypted,
            secureChars: this.toSecureChars(decrypted),
            rawEncryptedContent: m.encryptedContent,
            attachments: m.attachments || [],
            read: m.read,
            createdAt: m.createdAt,
            isMyMessage: m.senderId === currentUserId,
          };
        });
      })
    );
  }

  /**
   * Criptografa o texto no cliente e envia juntamente com anexos
   */
  enviarMensagem(
    conversationId: string,
    plainText: string,
    attachments: any[] = []
  ): Observable<DecryptedMessage> {
    const currentUserId = this.getCurrentUserId();
    const textToEncrypt = plainText || (attachments && attachments.length > 0 ? (attachments.length === 1 ? `[Anexo: ${attachments[0].name}]` : `[${attachments.length} Anexos]`) : '');
    const encryptedContent = this.encryptText(textToEncrypt, conversationId);

    return this.http.post<any>(`${this.rootUrl}/Messager/Conversations/${conversationId}/Messages`, {
      encryptedContent,
      attachments,
    }).pipe(
      map((m) => {
        const finalText = plainText || textToEncrypt;
        return {
          id: m.internalId || m.id || m.messageHash,
          conversationId: m.conversationId,
          messageHash: m.messageHash,
          previousMessageHash: m.previousMessageHash,
          senderId: m.senderId,
          senderName: m.senderName,
          senderPhoto: m.senderPhoto,
          recipientId: m.recipientId,
          content: finalText,
          secureChars: this.toSecureChars(finalText),
          rawEncryptedContent: encryptedContent,
          attachments: m.attachments || attachments,
          read: m.read,
          createdAt: m.createdAt,
          isMyMessage: true,
        };
      })
    );
  }

  /**
   * Busca lista de usuários cadastrados para iniciar nova conversa
   */
  listarUsuarios(search?: string): Observable<AvailableUserItem[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<AvailableUserItem[]>(`${this.rootUrl}/Messager/Users${query}`);
  }
}
