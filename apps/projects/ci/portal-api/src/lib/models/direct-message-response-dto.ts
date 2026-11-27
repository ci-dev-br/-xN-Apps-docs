/* tslint:disable */
/* eslint-disable */
import { MessageAttachmentDto } from '../models/message-attachment-dto';
export interface DirectMessageResponseDto {

  /**
   * Anexos da mensagem
   */
  attachments?: Array<MessageAttachmentDto>;

  /**
   * Hash do canal da conversa
   */
  channelHash?: string;

  /**
   * ID da conversa / canal
   */
  conversationId?: string;

  /**
   * Data de criação da mensagem
   */
  createdAt?: string;

  /**
   * Conteúdo cifrado em AES-256
   */
  encryptedContent?: string;

  /**
   * ID alternativo da mensagem
   */
  id?: string;

  /**
   * ID interno da mensagem
   */
  internalId?: string;

  /**
   * IV utilizado na cifra
   */
  iv?: string;

  /**
   * Hash SHA-256 da mensagem
   */
  messageHash?: string;

  /**
   * Hash da mensagem anterior na cadeia
   */
  previousMessageHash?: string;

  /**
   * Status de leitura
   */
  read?: boolean;

  /**
   * ID do destinatário (decodificado em memória)
   */
  recipientId?: string;

  /**
   * ID do remetente (decodificado em memória)
   */
  senderId?: string;

  /**
   * Nome do remetente (decodificado em memória)
   */
  senderName?: string;

  /**
   * Foto do remetente (decodificada em memória)
   */
  senderPhoto?: string;
}
