/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface File {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  data?: {
} | null;
  deleted?: boolean | null;
  format?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  metadata?: {
} | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
