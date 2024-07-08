/* tslint:disable */
/* eslint-disable */
import { DocumentoIdentificacao } from '../models/documento-identificacao';
export interface Pessoa {
  createdAt?: string | null;
  createdBy?: {
} | null;
  documentos?: Array<DocumentoIdentificacao> | null;
  emailPessoal?: string | null;
  empresa?: string | null;
  endereco?: Array<string> | null;
  informacoesContato?: Array<string> | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: {
} | null;

  /**
   * Nome
   */
  nome?: string | null;
  nomeFantasia?: string | null;
  razaoSocial?: string | null;
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
