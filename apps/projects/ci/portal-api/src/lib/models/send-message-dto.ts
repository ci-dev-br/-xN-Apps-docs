/* tslint:disable */
/* eslint-disable */
export interface SendMessageDto {

  /**
   * Lista de anexos da mensagem
   */
  attachments?: Array<{
}>;

  /**
   * Conteúdo criptografado no cliente via AES-256
   */
  encryptedContent: string;

  /**
   * Vetor de inicialização (IV) opcional utilizado na cifra
   */
  iv?: string;
}
