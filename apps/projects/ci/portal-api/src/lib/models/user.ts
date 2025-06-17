/* tslint:disable */
/* eslint-disable */
import { Policy } from '../models/policy';
import { Tenant } from '../models/tenant';
export interface User {
  email?: string | null;
  emailVerificado?: boolean | null;
  fullName?: string | null;
  id?: string | null;
  permission?: Array<Policy> | null;
  phone?: string | null;
  refreshToken?: string | null;
  roles?: Array<string> | null;
  surname?: string | null;
  tenants?: Array<Tenant> | null;
  username?: string | null;
}
