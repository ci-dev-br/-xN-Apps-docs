/* tslint:disable */
/* eslint-disable */
export interface TypeScriptPackageDocInputDto {

  /**
   * Caminho do arquivo de referência para localizar o node_modules
   */
  filePath?: string;

  /**
   * Nome do pacote ou módulo instalado (ex: @angular/core, rxjs)
   */
  packageName: string;
}
