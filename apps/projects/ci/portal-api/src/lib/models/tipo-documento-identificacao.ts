/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface TipoDocumentoIdentificacao {
  code?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição
   */
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  tenants?: Array<string> | null;
}
