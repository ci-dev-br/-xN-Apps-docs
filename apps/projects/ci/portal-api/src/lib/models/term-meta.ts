/* tslint:disable */
/* eslint-disable */
import { Term } from '../models/term';
export interface TermMeta {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;
  key?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  metaId?: string | null;
  tenants?: Array<string> | null;
  term?: Term | null;
  value?: string | null;
}
