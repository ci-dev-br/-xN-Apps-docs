/* tslint:disable */
/* eslint-disable */
import { AccessCredential } from '../models/access-credential';
import { Buffer } from '../models/buffer';
export interface Photo {
  createdAt?: string | null;
  createdBy?: AccessCredential | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: AccessCredential | null;
  originalFile?: Buffer | null;
  tenants?: Array<string> | null;
}
