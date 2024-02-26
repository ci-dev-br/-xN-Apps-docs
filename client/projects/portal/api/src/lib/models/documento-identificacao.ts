/* tslint:disable */
/* eslint-disable */
import { AccessCredential } from '../models/access-credential';
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface DocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: AccessCredential | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: AccessCredential | null;
  numeroDocumento?: string | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
