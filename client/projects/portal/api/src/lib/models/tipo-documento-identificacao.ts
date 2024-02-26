/* tslint:disable */
/* eslint-disable */
import { AccessCredential } from '../models/access-credential';
export interface TipoDocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: AccessCredential | null;

  /**
   * Descrição
   */
  description: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: AccessCredential | null;
  tenants?: Array<string> | null;
}
