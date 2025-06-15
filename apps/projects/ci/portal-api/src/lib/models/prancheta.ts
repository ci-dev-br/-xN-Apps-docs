/* tslint:disable */
/* eslint-disable */
import { Card } from '../models/card';
export interface Prancheta {
  cards?: Array<Card> | null;

  /**
   * Código interno para prancheta Padrão, permite compartilhar a prancheta internamente entre usuários a partir de seu código global
   */
  codigoGlobal?: string | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  layout?: string | null;
  order?: number | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
