/* tslint:disable */
/* eslint-disable */
export interface SitePage {

  /**
   * Conteúdo HTML da página
   */
  content: Array<string>;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  tempalte: string;
  tenants?: Array<string> | null;

  /**
   * Endereço público da página
   */
  urlMatch: string;
}
