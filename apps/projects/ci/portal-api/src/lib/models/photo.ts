/* tslint:disable */
/* eslint-disable */
import { Buffer } from '../models/buffer';
export interface Photo {
  createdAt?: string | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  originalFile?: Buffer | null;
  tenants?: Array<string> | null;
}
