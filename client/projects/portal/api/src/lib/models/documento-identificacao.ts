/* tslint:disable */
/* eslint-disable */
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
import { User } from '../models/user';
export interface DocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: User | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: User | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
