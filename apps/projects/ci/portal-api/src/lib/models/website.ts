/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { User } from '../models/user';
export interface Website {
  admin?: User | null;
  atributes?: {
} | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  domain?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  modules?: Array<Array<any>> | null;
  name?: string | null;
  tenants?: Array<string> | null;
  theme?: string | null;
  users?: Array<User> | null;
}
