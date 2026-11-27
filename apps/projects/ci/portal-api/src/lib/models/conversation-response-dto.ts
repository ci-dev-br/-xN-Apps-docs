/* tslint:disable */
/* eslint-disable */
export interface ConversationResponseDto {

  /**
   * Hash determinístico único do canal
   */
  channelHash?: string;

  /**
   * ID do contato/destinatário
   */
  contactId: string;

  /**
   * Nome do contato
   */
  contactName: string;

  /**
   * Foto/Avatar do contato
   */
  contactPhoto?: string | null;

  /**
   * Identificador do canal ou ID interno da conversa
   */
  id: string;

  /**
   * Data da última mensagem ou de criação
   */
  lastMessageAt?: string;

  /**
   * Última mensagem cifrada
   */
  lastMessageEncrypted?: string | null;

  /**
   * Hash da última mensagem
   */
  lastMessageHash?: string;

  /**
   * Título da conversa
   */
  title?: string;

  /**
   * Contador de mensagens não lidas
   */
  unreadCount?: number;
}
