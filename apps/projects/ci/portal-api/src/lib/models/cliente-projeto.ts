/* tslint:disable */
/* eslint-disable */
import { Pessoa } from '../models/pessoa';
export interface ClienteProjeto {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  documento: string | null;
  email: string | null;
  endereco: Array<string> | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  nome: string | null;
  pessoa: Pessoa;
  telefone: string | null;
  tenants?: Array<string> | null;
  tipo: string | null;
}
