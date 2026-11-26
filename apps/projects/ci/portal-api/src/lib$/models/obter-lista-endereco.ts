/* tslint:disable */
/* eslint-disable */
import { Endereco } from '../models/endereco';
export interface ObterListaEndereco {
  filter?: Endereco | null;
  orderBy?: {
} | null;
  relations?: {
} | null;
  search?: string | null;
  skip?: number | null;
  take?: number | null;
  where?: Endereco | null;
}
