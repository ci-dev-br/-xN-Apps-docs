/* tslint:disable */
/* eslint-disable */
import { Projeto } from '../models/projeto';
export interface WorkItem {
  code?: number | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  project: Projeto;
  tenants?: Array<string> | null;
}
