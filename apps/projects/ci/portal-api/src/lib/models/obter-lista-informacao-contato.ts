/* tslint:disable */
/* eslint-disable */
import { InformacaoContato } from './informacao-contato';
export interface ObterListaInformacaoContato {
  skip?: number | null;
  take?: number | null;
  where?: Partial<InformacaoContato> | null;
  filter?: Partial<InformacaoContato> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
