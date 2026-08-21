/* tslint:disable */
/* eslint-disable */
import { Photo } from '../models/photo';
import { Policy } from '../models/policy';
import { Tenant } from '../models/tenant';
import { UserPreference } from '../models/user-preference';
export interface User {
  createdAt?: string | null;
  email?: string | null;
  emailVerificado?: boolean | null;
  fullName?: string | null;
  id?: string | null;
  permission?: Array<Policy> | null;
  phone?: string | null;
  photo?: Photo | null;
  preferences?: Array<UserPreference> | null;
  refreshToken?: string | null;
  roles?: Array<string> | null;
  surname?: string | null;
  tenants?: Array<Tenant> | null;
  updatedAt?: string | null;
  username?: string | null;
}
