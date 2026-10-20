/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Servico {
  categoria: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  descricao: string | null;
  duracaoEstimada: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  nome: string;
  preco: number;
  tenants?: Array<string> | null;
}
