/* tslint:disable */
/* eslint-disable */
import { Perguntas } from '../models/perguntas';
export interface Forms {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  perguntas?: Perguntas | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
