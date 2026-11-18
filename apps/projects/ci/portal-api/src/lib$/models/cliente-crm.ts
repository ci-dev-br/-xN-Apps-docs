/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface ClienteCrm {
  cep: string | null;
  cidade: string | null;
  cpf: string;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataCadastro: string;
  dataNascimento: Date | null;
  deleted?: boolean | null;
  email: string | null;
  endereco: string | null;
  estado: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  nome: string;
  observacoes: string | null;
  telefone: string | null;
  tenants?: Array<string> | null;
}
