/* tslint:disable */
/* eslint-disable */
import { Endereco } from './endereco';
export interface ObterListaEndereco {
  skip?: number | null;
  take?: number | null;
  where?: Partial<Endereco> | null;
  filter?: Partial<Endereco> | null;
  search?: string | null;
  orderBy?: Record<string, 'ASC' | 'DESC'> | null;
  relations?: any;
}
