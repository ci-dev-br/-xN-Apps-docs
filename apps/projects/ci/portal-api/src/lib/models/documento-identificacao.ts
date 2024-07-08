/* tslint:disable */
/* eslint-disable */
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface DocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;
  numeroDocumento?: string | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
