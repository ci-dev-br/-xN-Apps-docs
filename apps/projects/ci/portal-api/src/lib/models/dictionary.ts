/* tslint:disable */
/* eslint-disable */
import { Language } from '../models/language';
export interface Dictionary {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  descrition?: string | null;
  internalId?: string | null;
  language?: Language | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  localRepoUri?: string | null;
  tenants?: Array<string> | null;
}
