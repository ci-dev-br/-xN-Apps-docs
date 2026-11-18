/* tslint:disable */
/* eslint-disable */
import { DocumentoIdentificacao } from '../models/documento-identificacao';
export interface ObterListaDocumentoIdentificacao {
  filter?: DocumentoIdentificacao | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: DocumentoIdentificacao | null;
}
