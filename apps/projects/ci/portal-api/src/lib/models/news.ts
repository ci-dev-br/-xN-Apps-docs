/* tslint:disable */
/* eslint-disable */
export interface News {

  /**
   * Conteúdo em texto extraído da página web
   */
  content: string;
  id: string;
  modifiedAt?: string | null;
  source: string;
  sourceName: string;
  title: string;
  url: string;
}
