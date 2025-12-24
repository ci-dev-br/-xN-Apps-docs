/* tslint:disable */
/* eslint-disable */
import { DocumentoIdentificacao } from '../models/documento-identificacao';
import { Endereco } from '../models/endereco';
import { InformacaoContato } from '../models/informacao-contato';
export interface Pessoa {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  documentos?: Array<DocumentoIdentificacao> | null;
  emailPessoal?: string | null;
  empresa?: string | null;
  endereco?: Array<Endereco> | null;
  informacoesContato?: Array<InformacaoContato> | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;

  /**
   * Nome
   */
  nome?: string | null;
  nomeFantasia?: string | null;
  razaoSocial?: string | null;

  /**
   * Registro Geral em Caso de Pessoa Física registrada em território Brasileiro de acordo com a Constituição Federal. Obrigatório em casos de recolhimentos automatizados de documentos juntos ao estado. Sendo opcional para casos de alimentação manual de base. Esse documento se torna obrigatório em caso de automações junto ao estado em nome do próprio requerente. Sendo obrigatório a autorização direta do uso de seus dados. Com cancelamento ativo por parte do sistema em contato direto com o solicitante.
   */
  registroGeralRepublicaBrasileira?: string | null;
  registroGeralRepublicaBrasileiraOrgaoEmissorOrgaoEmissor?: string | null;
  site?: string | null;

  /**
   * Sobrenome
   */
  sobrenome?: string | null;
  tenants?: Array<string> | null;
  tipoJuridico?: ('F' | 'J') | null;
}
