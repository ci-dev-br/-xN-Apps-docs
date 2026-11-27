/* tslint:disable */
/* eslint-disable */
import { MessageAttachmentDto } from '../models/message-attachment-dto';
export interface SendMessageDto {

  /**
   * Lista de anexos da mensagem
   */
  attachments?: Array<MessageAttachmentDto>;

  /**
   * Conteúdo criptografado no cliente via AES-256
   */
  encryptedContent: string;

  /**
   * Vetor de inicialização (IV) opcional utilizado na cifra
   */
  iv?: string;
}
