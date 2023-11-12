/* tslint:disable */
/* eslint-disable */
import { User } from '../models/user';
export interface Pessoa {
  createdAt?: string | null;
  createdBy?: User | null;
  emailPessoal: string;
  empresa: string;
  endereco: Array<string>;
  informacoesContato: Array<string>;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: User | null;
  nomeFantasia: string;
  razaoSocial: string;
  rg: string;
  rgOrgaoEmissor: string;
  tenants?: Array<string> | null;
}
