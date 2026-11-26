/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Conversation {

  /**
   * Hash determinístico único do canal (protegido no banco)
   */
  channelHash: string;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Metadados criptografados do participante 1 (nome, foto, id)
   */
  encryptedMetadataUser1: string;

  /**
   * Metadados criptografados do participante 2 (nome, foto, id)
   */
  encryptedMetadataUser2: string;
  internalId?: string | null;

  /**
   * Data da última mensagem
   */
  lastMessageAt: string;

  /**
   * Última mensagem cifrada
   */
  lastMessageEncrypted: string;

  /**
   * Hash da última mensagem da conversa (elo da hash chain)
   */
  lastMessageHash: string;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Hash cego do participante 1 para consulta segura
   */
  participant1Hash: string;

  /**
   * Hash cego do participante 2 para consulta segura
   */
  participant2Hash: string;
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
   * ID do primeiro participante (legado)
   */
  user1Id: string;

  /**
   * Nome do primeiro participante (legado)
   */
  user1Name: string;

  /**
   * Foto do primeiro participante (legado)
   */
  user1Photo: string;

  /**
   * ID do segundo participante (legado)
   */
  user2Id: string;

  /**
   * Nome do segundo participante (legado)
   */
  user2Name: string;

  /**
   * Foto do segundo participante (legado)
   */
  user2Photo: string;
}
