/* tslint:disable */
/* eslint-disable */
import { Website } from '../models/website';
export interface SitePost {
  author?: string | null;
  content?: Array<Array<any>> | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  excerpt?: string | null;
  guid?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  menuOrder?: number | null;
  status?: ('publish' | 'draft' | 'auto-draft') | null;
  tenants?: Array<string> | null;
  title?: string | null;
  website: Website;
}
