/* tslint:disable */
/* eslint-disable */
export interface ReaderNewsDigestItemDto {

  /**
   * Autor ou veículo original da notícia
   */
  author: string;
  category?: string;

  /**
   * Total de votos negativos (DOWN)
   */
  dislikes: number;
  id: string;

  /**
   * Total de curtidas (votos UP)
   */
  likes: number;

  /**
   * Link original da notícia
   */
  originalUrl: string;

  /**
   * Data/hora de publicação ou coleta da notícia
   */
  publishedAt: string;
  snippet?: string;
  title: string;
}
