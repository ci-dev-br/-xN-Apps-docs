/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Website } from '../models/website';
export interface SitePage {

  /**
   * Conteúdo HTML da página
   */
  content: Array<string>;
  contentType?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  tempalte: string;
  tenants?: Array<string> | null;

  /**
   * Endereço público da página
   */
  urlMatch: string;

  /**
   * Website correspondente
   */
  website: Website;
}
