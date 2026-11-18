/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Pais {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  ibgeCode?: string | null;
  internalId?: string | null;
  internationaName?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  nome?: string | null;
  referenciasExternas?: Array<string> | null;
  tenants?: Array<string> | null;
}
