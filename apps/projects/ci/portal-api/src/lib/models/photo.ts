/* tslint:disable */
/* eslint-disable */
import { Buffer } from '../models/buffer';
export interface Photo {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  originalFile?: Buffer | null;
  tenants?: Array<string> | null;
}
