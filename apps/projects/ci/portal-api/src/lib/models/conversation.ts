/* tslint:disable */
/* eslint-disable */
export interface Conversation {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;

  /**
   * Data da última mensagem
   */
  lastMessageAt: string;

  /**
   * Última mensagem cifrada
   */
  lastMessageEncrypted: string;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  tenants?: Array<string> | null;

  /**
   * Título opcional da conversa
   */
  title: string;

  /**
   * Mensagens não lidas para o usuário 1
   */
  unreadCountUser1: number;

  /**
   * Mensagens não lidas para o usuário 2
   */
  unreadCountUser2: number;

  /**
   * ID do primeiro participante
   */
  user1Id: string;

  /**
   * Nome do primeiro participante
   */
  user1Name: string;

  /**
   * Foto do primeiro participante
   */
  user1Photo: string;

  /**
   * ID do segundo participante
   */
  user2Id: string;

  /**
   * Nome do segundo participante
   */
  user2Name: string;

  /**
   * Foto do segundo participante
   */
  user2Photo: string;
}
