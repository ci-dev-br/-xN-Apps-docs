/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Produto {
  categoria: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  descricao: string | null;
  estoque: number;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  marca: string | null;
  nome: string;
  precoCusto: number;
  precoVenda: number;
  tenants?: Array<string> | null;
}
