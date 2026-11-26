/* tslint:disable */
/* eslint-disable */
export interface TypeScriptResourceInputDto {

  /**
   * Conteúdo opcional do arquivo ativo
   */
  fileContent?: string;

  /**
   * Caminho do arquivo solicitado no workspace
   */
  filePath: string;

  /**
   * Profundidade máxima de resolução recursiva
   */
  maxDepth?: number;
}
