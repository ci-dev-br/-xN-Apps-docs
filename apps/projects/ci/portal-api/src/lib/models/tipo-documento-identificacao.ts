/* tslint:disable */
/* eslint-disable */
import { ChaveAcesso } from '../models/chave-acesso';
export interface TipoDocumentoIdentificacao {
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;

  /**
   * Descrição
   */
  description: string | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;
  tenants?: Array<string> | null;
}
