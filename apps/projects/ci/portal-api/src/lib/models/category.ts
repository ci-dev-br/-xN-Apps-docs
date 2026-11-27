/* tslint:disable */
/* eslint-disable */
export interface Category {
  id: string;

  /**
   * Se o assunto está em alta no momento
   */
  isTrending: boolean;
  name: string;

  /**
   * Volume aproximado de buscas que tornou o assunto tendência
   */
  trendVolume: number;
}
