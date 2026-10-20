/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface InformacaoContato {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  description?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  linkedin?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  tenants?: Array<string> | null;
  tiktok?: string | null;
  whatsAppNumber?: string | null;
}
