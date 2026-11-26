/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Perguntas } from '../models/perguntas';
export interface Forms {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  perguntas?: Perguntas | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
