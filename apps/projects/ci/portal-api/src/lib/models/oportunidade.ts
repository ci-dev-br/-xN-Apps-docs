/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Oportunidade {

  /**
   * Identificador interno (UUID) do cliente CRM vinculado
   */
  clienteId?: string | null;

  /**
   * Nome do cliente ou empresa prospectada
   */
  clienteNome?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;

  /**
   * Data e hora de fechamento quando marcada como ganha ou perdida
   */
  dataFechamento?: string | null;

  /**
   * Data e hora em que a oportunidade entrou na etapa atual
   */
  dataMudancaEtapa?: string | null;
  deleted?: boolean | null;

  /**
   * Estágio atual da oportunidade no pipeline comercial
   */
  estagio?: 'lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Notas e detalhes adicionais da negociação
   */
  observacoes?: string | null;

  /**
   * Data prevista para conclusão do negócio
   */
  previsaoFechamento?: string | null;

  /**
   * Prioridade comercial da oportunidade
   */
  prioridade?: 'alta' | 'media' | 'baixa';

  /**
   * Probabilidade estimada de fechamento (0 a 100)
   */
  probabilidade?: number | null;

  /**
   * Identificador interno (UUID) do profissional responsável
   */
  profissionalId?: string | null;

  /**
   * Nome do corretor, vendedor ou responsável pela oportunidade
   */
  responsavel?: string | null;
  tenants?: Array<string> | null;

  /**
   * Título da oportunidade comercial no funil de vendas
   */
  titulo: string;

  /**
   * Valor monetário estimado da oportunidade
   */
  valor?: number | null;
}
