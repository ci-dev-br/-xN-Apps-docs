/* tslint:disable */
/* eslint-disable */
export interface Conversation {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  participants: Array<Conversation>;
  tenants?: Array<string> | null;
  title?: string | null;
}
