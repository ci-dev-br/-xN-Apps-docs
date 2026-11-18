/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Pessoa } from '../models/pessoa';
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface DocumentoIdentificacao {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  numeroDocumento?: string | null;
  pessoa?: Pessoa | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
