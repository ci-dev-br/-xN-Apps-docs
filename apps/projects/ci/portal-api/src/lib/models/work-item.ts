/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Projeto } from '../models/projeto';
export interface WorkItem {
  code?: number | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  project: Projeto;
  tenants?: Array<string> | null;
}
