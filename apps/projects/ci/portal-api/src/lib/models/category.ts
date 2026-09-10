/* tslint:disable */
/* eslint-disable */
export interface Category {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  description: string;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  name: string;
  tenants?: Array<string> | null;
}
