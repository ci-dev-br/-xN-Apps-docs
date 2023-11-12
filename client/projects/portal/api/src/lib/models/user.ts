/* tslint:disable */
/* eslint-disable */
import { Photo } from '../models/photo';
import { Policy } from '../models/policy';
export interface User {
  email?: string | null;
  fullName?: string | null;
  id?: string | null;
  password?: string | null;
  permission?: Array<Policy> | null;
  phone?: string | null;
  photo?: Photo | null;
  refreshToken?: string | null;
  roles?: Array<string> | null;
  username?: string | null;
}
