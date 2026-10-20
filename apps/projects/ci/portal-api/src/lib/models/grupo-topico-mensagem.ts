/* tslint:disable */
/* eslint-disable */
export interface GrupoTopicoMensagem {

  /**
   * ID do autor da resposta
   */
  authorId: string;
  authorName: string | null;
  authorPhoto: string | null;

  /**
   * Texto da resposta
   */
  content: string;
  createdAt: string | null;
  id: string;

  /**
   * ID do tópico de discussão
   */
  topicoId: string;
}
