/* tslint:disable */
/* eslint-disable */
import { Policy } from '../models/policy';
export interface User {
  email?: string | null;
  fullName?: string | null;
  id?: string | null;
  password?: string | null;
  permission?: Array<Policy> | null;
  phone?: string | null;
  refreshToken?: string | null;
  username?: string | null;
}
