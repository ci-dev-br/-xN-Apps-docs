/* tslint:disable */
/* eslint-disable */
export interface CatalogAppDto {

  /**
   * Chave única da aplicação (ex: Mensagens, Arquivos)
   */
  appKey: string;

  /**
   * Autores dos commits da pasta
   */
  authors?: Array<string>;

  /**
   * Categoria
   */
  categoria?: string;

  /**
   * Co-autores identificados nas mensagens dos commits
   */
  coAuthors?: Array<string>;

  /**
   * Colaboradores
   */
  collaborators?: Array<string>;

  /**
   * Quantidade de commits na pasta da aplicação
   */
  commitCount?: number;

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
   * Caminho da pasta do repositório onde reside a aplicação
   */
  folderPath?: string;

  /**
   * Hash do commit Git
   */
  gitVersionHash?: string;

  /**
   * Ícone da aplicação
   */
  icon?: string;

  /**
   * Data do último commit da aplicação
   */
  lastCommitDate?: {
};

  /**
   * Módulos ou aplicações padrão combinados
   */
  modules?: Array<string>;

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
