/* tslint:disable */
/* eslint-disable */
export interface TypeScriptDefinitionInputDto {

  /**
   * Número da coluna (1-indexed)
   */
  column?: number;
  fileContent?: string;

  /**
   * Caminho do arquivo no workspace
   */
  filePath: string;

  /**
   * Número da linha (1-indexed)
   */
  line?: number;

  /**
   * Nome do símbolo ou import
   */
  symbolName?: string;
}
