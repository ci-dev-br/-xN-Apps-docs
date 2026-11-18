/* tslint:disable */
/* eslint-disable */
import { TipoDocumentoIdentificacao } from '../models/tipo-documento-identificacao';
export interface ObterListaTipoDocumentoIdentificacao {
  filter?: TipoDocumentoIdentificacao | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: TipoDocumentoIdentificacao | null;
}
