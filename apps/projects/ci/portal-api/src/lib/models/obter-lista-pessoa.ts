/* tslint:disable */
/* eslint-disable */
import { Pessoa } from './pessoa';
export interface ObterListaPessoa {
  skip?: number | null;
  take?: number | null;
  where?: Partial<Pessoa> | null;
  filter?: Partial<Pessoa> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
}
