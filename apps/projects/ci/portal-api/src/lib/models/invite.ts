/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Invite {
  accepted?: boolean | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  email?: string | null;
  friendlyName?: string | null;
  internalId?: string | null;
  inviteHash?: string | null;
  invited?: boolean | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  mensagem?: string | null;
  phoneSMS?: string | null;
  phoneWhatsApp?: string | null;
  roles?: Array<string> | null;
  tenantIds?: Array<string> | null;
  tenants?: Array<string> | null;
}
