/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Term } from '../models/term';
export interface TermMeta {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  key?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  metaId?: string | null;
  tenants?: Array<string> | null;
  term?: Term | null;
  value?: string | null;
}
