/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
export interface TipoDocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: User | null;

  /**
   * Descrição
   */
  description: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: User | null;
  tenants?: Array<string> | null;
}
