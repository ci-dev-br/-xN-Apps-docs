/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface CommentMeta {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  tenants?: Array<string> | null;
}
