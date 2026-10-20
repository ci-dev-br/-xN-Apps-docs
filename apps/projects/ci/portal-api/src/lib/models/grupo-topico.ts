/* tslint:disable */
/* eslint-disable */
export interface GrupoTopico {

  /**
   * ID do autor
   */
  authorId: string;
  authorName: string | null;
  authorPhoto: string | null;

  /**
   * Conteúdo da mensagem inicial
   */
  content: string;
  createdAt: string | null;

  /**
   * ID do grupo
   */
  grupoId: string;
  id: string;
  repliesCount: number;

  /**
   * ID do tenant do grupo para isolamento de dados
   */
  tenantId: string;

  /**
   * Título do tópico
   */
  title: string;
  updatedAt: string | null;
}
