/* tslint:disable */
/* eslint-disable */
export interface PublishActionInputDto {

  /**
   * Ação de publicação: gulp (compilar e publicar cliente produção), sync-public (atualizar apps/dist/apps/browser em server/public), server-build (compilar backend e reiniciar), full-publish (cliente + backend + cache + restart), restart (reiniciar serviço e caches), reload-cache (limpar cache AppController) ou sync-git
   */
  action?: 'gulp' | 'sync-public' | 'server-build' | 'full-publish' | 'restart' | 'reload-cache' | 'sync-git';
}
