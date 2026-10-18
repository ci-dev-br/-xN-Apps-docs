/* tslint:disable */
/* eslint-disable */
import { TipoDocumentoIdentificacao } from './tipo-documento-identificacao';
export interface ObterListaTipoDocumentoIdentificacao {
  skip?: number | null;
  take?: number | null;
  where?: Partial<TipoDocumentoIdentificacao> | null;
  filter?: Partial<TipoDocumentoIdentificacao> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
