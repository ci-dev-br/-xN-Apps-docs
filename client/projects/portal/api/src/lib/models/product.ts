/* tslint:disable */
/* eslint-disable */
import { ChaveAcesso } from '../models/chave-acesso';
import { Marca } from '../models/marca';
export interface Product {
  codigoBarras?: string | null;
  codigoFabricanete?: string | null;
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;
  description?: string | null;
  gtin?: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;
  marca?: Marca | null;
  nossoCodigo?: string | null;
  shortDescription?: string | null;
  sku?: string | null;
  subGrupo?: string | null;
  tenants?: Array<string> | null;

  /**
   * URL do site
   */
  urlWebsiteOficial?: string | null;
}
