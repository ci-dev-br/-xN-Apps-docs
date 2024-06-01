/* tslint:disable */
/* eslint-disable */
import { ChaveAcesso } from '../models/chave-acesso';
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface DocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;
  numeroDocumento?: string | null;
  tenants?: Array<string> | null;
  tipo?: TipoDocumentoIdentificacao | null;
}
