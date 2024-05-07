/* tslint:disable */
/* eslint-disable */
import { ChaveAcesso } from '../models/chave-acesso';
export interface Marca {
  code?: string | null;
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;
  name?: string | null;
  siteUrl?: string | null;
  tenants?: Array<string> | null;
}
