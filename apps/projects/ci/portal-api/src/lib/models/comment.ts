/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Comment {
  author?: string | null;
  authorEmail?: string | null;
  authorIp?: string | null;
  authorUrl?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  publishingAt?: string | null;
  tenants?: Array<string> | null;
}
