/* tslint:disable */
/* eslint-disable */
export interface PublishActionInputDto {

  /**
   * Ação de publicação: gulp (nova versão cliente produção), server-build (compilar backend produção), full-publish (cliente + backend) ou sync-git
   */
  action?: 'gulp' | 'server-build' | 'full-publish' | 'sync-git';
}
