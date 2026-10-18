/* tslint:disable */
/* eslint-disable */
import { DocumentoIdentificacao } from './documento-identificacao';
export interface ObterListaDocumentoIdentificacao {
  skip?: number | null;
  take?: number | null;
  where?: Partial<DocumentoIdentificacao> | null;
  filter?: Partial<DocumentoIdentificacao> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
