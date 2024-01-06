/* tslint:disable */
/* eslint-disable */
import { DocumentoIdentificacao } from '../models/documento-identificacao';
import { User } from '../models/user';
export interface Pessoa {
  createdAt?: string | null;
  createdBy?: User | null;
  documentos: DocumentoIdentificacao;
  emailPessoal: string;
  empresa?: string | null;
  endereco?: Array<string> | null;
  informacoesContato: Array<string>;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: User | null;

  /**
   * Nome
   */
  nome?: string | null;
  nomeFantasia: string;
  razaoSocial: string;
  registroGeralRepublicaBrasileira?: string | null;
  registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor: string;
  site?: string | null;

  /**
   * Sobrenome
   */
  sobrenome?: string | null;
  tenants?: Array<string> | null;
  tipoJuridico?: string | null;
}
