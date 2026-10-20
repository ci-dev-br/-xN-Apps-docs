/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Endereco {
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  logradouro?: string | null;
  province?: string | null;
  tenants?: Array<string> | null;
}
