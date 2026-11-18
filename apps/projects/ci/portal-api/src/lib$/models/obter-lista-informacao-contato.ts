/* tslint:disable */
/* eslint-disable */
import { InformacaoContato } from '../models/informacao-contato';
export interface ObterListaInformacaoContato {
  filter?: InformacaoContato | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: InformacaoContato | null;
}
