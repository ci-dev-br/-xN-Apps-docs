/* tslint:disable */
/* eslint-disable */
export interface Term {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  name: string;
  slug: string;
  tenants?: Array<string> | null;
  termGroup: string;
}
