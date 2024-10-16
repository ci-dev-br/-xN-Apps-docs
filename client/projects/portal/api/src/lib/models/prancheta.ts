/* tslint:disable */
/* eslint-disable */
import { Card } from '../models/card';
import { ChaveAcesso } from '../models/chave-acesso';
export interface Prancheta {
  cards?: Array<Card> | null;
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;
  layout?: string | null;
  order?: number | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
