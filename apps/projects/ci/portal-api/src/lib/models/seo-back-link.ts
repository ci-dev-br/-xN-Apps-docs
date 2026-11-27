/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { SeoPage } from '../models/seo-page';
export interface SeoBackLink {

  /**
   * Texto clicável do link externo
   */
  ancora?: string | null;

  /**
   * Indica se o backlink está ativo e verificado
   */
  ativo?: boolean | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * URL de destino (página do domínio)
   */
  enderecoRetorno?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * URL externa que aponta para o domínio
   */
  origemUrl?: string | null;

  /**
   * Página SEO vinculada ao backlink
   */
  pagina?: SeoPage | null;

  /**
   * Tipo de relação do link (dofollow, nofollow, ugc, sponsored)
   */
  rel?: ('dofollow' | 'nofollow' | 'ugc' | 'sponsored') | null;
  tenants?: Array<string> | null;
}
