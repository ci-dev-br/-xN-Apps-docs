/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface SeoDomain {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Hostname ou domínio principal (ex.: ci.dev.br)
   */
  hostname?: string | null;
  internalId?: string | null;

  /**
   * Endereços IP associados ao domínio
   */
  ipsHandShake?: Array<string> | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Nome identificador do domínio ou projeto SEO
   */
  nome?: string | null;

  /**
   * Endereço completo do sitemap.xml
   */
  sitemapUrl?: string | null;
  tenants?: Array<string> | null;

  /**
   * Indica se a propriedade está verificada no Search Console
   */
  verificado?: boolean | null;
}
