/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Marca {
  code?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  name?: string | null;
  siteUrl?: string | null;
  tenants?: Array<string> | null;
}
