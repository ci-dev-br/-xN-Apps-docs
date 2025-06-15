/* tslint:disable */
/* eslint-disable */
import { Marca } from '../models/marca';
import { UnidadeMedida } from '../models/unidade-medida';
export interface Product {
  codigoBarras?: string | null;
  codigoFabricanete?: string | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  description?: string | null;
  gtin?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  marca?: Marca | null;
  moeda?: string | null;
  name?: string | null;
  nossoCodigo?: string | null;
  shortDescription?: string | null;
  sku?: string | null;
  subGrupo?: string | null;
  tenants?: Array<string> | null;
  unidadeMedida?: UnidadeMedida | null;

  /**
   * URL do site
   */
  urlWebsiteOficial?: string | null;
}
