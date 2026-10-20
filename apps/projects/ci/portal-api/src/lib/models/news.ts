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

  // Propriedades anexadas de feed, categoria, fonte e interações sociais
  categoria?: string;
  category?: { id?: string; name?: string; is_trending?: boolean } | null;
  sourceInfo?: { id?: string; name?: string; domain?: string; searchUrlTemplate?: string } | null;
  scrapedAt?: string | Date;
  upVotes?: number;
  downVotes?: number;
  commentsCount?: number;
  userVote?: 'UP' | 'DOWN' | null;
}
