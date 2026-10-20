/* tslint:disable */
/* eslint-disable */
export interface InstallGitModuleDto {

  /**
   * Identificador único da aplicação
   */
  appKey: string;

  /**
   * Branch do repositório
   */
  branch?: string;

  /**
   * Configurações e parâmetros do módulo em formato chave-valor
   */
  configurations?: {
};

  /**
   * Descrição da aplicação
   */
  description?: string;

  /**
   * URL do repositório Git da aplicação
   */
  gitUrl: string;

  /**
   * Ícone da aplicação
   */
  icon?: string;

  /**
   * Nome da classe do módulo NestJS (ex: MeuModuloCustomizadoModule)
   */
  moduleName: string;

  /**
   * Nome de exibição da aplicação
   */
  name?: string;

  /**
   * Rota da aplicação no cliente (ex: /MinhaApp)
   */
  routePath?: string;
}
