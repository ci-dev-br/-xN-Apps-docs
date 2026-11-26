/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Profissional {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataContratacao: Date | null;
  deleted?: boolean | null;
  email: string | null;
  especialidade: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  nome: string;
  telefone: string | null;
  tenants?: Array<string> | null;
}
