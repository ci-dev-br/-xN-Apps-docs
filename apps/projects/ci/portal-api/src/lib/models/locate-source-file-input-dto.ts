/* tslint:disable */
/* eslint-disable */
export interface LocateSourceFileInputDto {

  /**
   * Subdiretório relativo ao workspace para restringir a busca
   */
  directory?: string;

  /**
   * Lista opcional de extensões permitidas (ex: [".ts", ".html", ".scss"])
   */
  extensions?: Array<string>;

  /**
   * Quantidade máxima de arquivos retornados
   */
  limit?: number;

  /**
   * Nome ou parte do nome do arquivo de código-fonte (ex: dyn-form.component.ts)
   */
  name: string;
}
