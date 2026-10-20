/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Domain {
  aplications?: Array<Array<any>> | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  hostname?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  tenants?: Array<string> | null;
  varified?: boolean | null;
}
