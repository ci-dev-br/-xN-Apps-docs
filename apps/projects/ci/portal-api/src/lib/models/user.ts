/* tslint:disable */
/* eslint-disable */
import { Photo } from '../models/photo';
import { Policy } from '../models/policy';
import { Tenant } from '../models/tenant';
export interface User {
  email?: string | null;
  emailVerificado?: boolean | null;
  fullName?: string | null;
  id?: string | null;
  permission?: Array<Policy> | null;
  phone?: string | null;
  photo?: Photo | null;
  refreshToken?: string | null;
  roles?: Array<string> | null;
  tenants?: Array<Tenant> | null;
  username?: string | null;
}
