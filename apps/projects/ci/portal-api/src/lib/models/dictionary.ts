/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Language } from '../models/language';
export interface Dictionary {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  descrition?: string | null;
  internalId?: string | null;
  language?: Language | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  localRepoUri?: string | null;
  tenants?: Array<string> | null;
}
