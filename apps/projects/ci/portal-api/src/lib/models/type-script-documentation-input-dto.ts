/* tslint:disable */
/* eslint-disable */
export interface TypeScriptDocumentationInputDto {
  column?: number;
  fileContent?: string;

  /**
   * Caminho do arquivo no workspace
   */
  filePath: string;
  line?: number;
  symbolName?: string;
}
