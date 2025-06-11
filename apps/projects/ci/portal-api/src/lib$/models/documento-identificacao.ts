/* tslint:disable */
/* eslint-disable */
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface DocumentoIdentificacao {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  numeroDocumento?: string | null;
  pessoa?: {
} | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
