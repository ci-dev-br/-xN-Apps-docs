/* tslint:disable */
/* eslint-disable */
import { Card } from '../models/card';
export interface Prancheta {
  cards?: Array<Card> | null;
  createdAt?: string | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  layout?: string | null;
  order?: number | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
