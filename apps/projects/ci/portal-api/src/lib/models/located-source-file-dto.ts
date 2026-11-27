/* tslint:disable */
/* eslint-disable */
export interface LocatedSourceFileDto {

  /**
   * Diretório relativo do arquivo
   */
  directory: string;
  extension: string;
  name: string;

  /**
   * Caminho relativo ao workspace raiz
   */
  path: string;
  score: number;
  size: number;
}
