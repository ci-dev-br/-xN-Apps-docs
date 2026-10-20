/* tslint:disable */
/* eslint-disable */
export interface CatalogAppDto {

  /**
   * Chave única da aplicação (ex: Mensagens, Arquivos)
   */
  appKey: string;

  /**
   * Categoria
   */
  categoria?: string;

  /**
   * Colaboradores
   */
  collaborators?: Array<string>;

  /**
   * Políticas contextuais adicionais
   */
  contextPolicies?: {
};

  /**
   * Descrição da aplicação
   */
  description?: string;

  /**
   * Hash do commit Git
   */
  gitVersionHash?: string;

  /**
   * Ícone da aplicação
   */
  icon?: string;

  /**
   * Nome da aplicação
   */
  name?: string;

  /**
   * Papéis necessários
   */
  roles?: Array<string>;

  /**
   * Rota da aplicação no painel
   */
  routePath?: string;
}
