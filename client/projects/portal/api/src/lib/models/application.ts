/* tslint:disable */
/* eslint-disable */
import { Domain } from '../models/domain';
export interface Application {
  description?: string | null;
  domain?: Domain | null;
  icon?: string | null;
  id?: string | null;
  name?: string | null;
  roles?: Array<string> | null;
  url?: string | null;
}
