/* tslint:disable */
/* eslint-disable */
export interface MessageAttachmentDto {

  /**
   * Conteúdo em Data URL (base64)
   */
  data?: string;

  /**
   * Nome do arquivo anexo
   */
  name: string;

  /**
   * Tamanho em bytes
   */
  size?: number;

  /**
   * MIME type do arquivo
   */
  type?: string;

  /**
   * URL pública do anexo
   */
  url?: string;
}
