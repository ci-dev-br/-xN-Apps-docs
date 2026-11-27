/* tslint:disable */
/* eslint-disable */
export interface PublishActionInputDto {

  /**
   * Ação de publicação: gulp (compila e publica cliente em server/public), sync-public (atualiza apps/dist/apps/browser em server/public e limpa cache), server-build (compila backend e reinicia serviço), full-publish (cliente + backend + cache + restart), restart (reinicia serviço e limpa caches), reload-cache (limpa cache de AppController) ou sync-git
   */
  action?: 'gulp' | 'sync-public' | 'server-build' | 'full-publish' | 'restart' | 'reload-cache' | 'sync-git';
}
