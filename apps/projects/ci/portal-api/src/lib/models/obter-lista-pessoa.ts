/* tslint:disable */
/* eslint-disable */
import { Pessoa } from '../models/pessoa';
export interface ObterListaPessoa {
  filter?: Pessoa | null;
  orderBy?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: Pessoa | null;
}
