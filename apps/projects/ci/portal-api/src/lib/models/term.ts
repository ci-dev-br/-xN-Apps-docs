/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Term {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  name: string;
  slug: string;
  tenants?: Array<string> | null;
  termGroup: string;
}
