/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface AtividadeCrm {

  /**
   * Identificador interno (UUID) do cliente CRM vinculado
   */
  clienteId?: string | null;

  /**
   * Nome do cliente ou empresa relacionada
   */
  clienteNome?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;

  /**
   * Data e hora previstas para realização do follow-up
   */
  dataPrevista?: string | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Anotações e contexto adicional do follow-up
   */
  observacoes?: string | null;

  /**
   * Identificador interno (UUID) da oportunidade vinculada
   */
  oportunidadeId?: string | null;

  /**
   * Descrição textual ou horário previsto (ex: Hoje às 15:00)
   */
  prazoTexto?: string | null;

  /**
   * Responsável pela execução da atividade
   */
  responsavel?: string | null;

  /**
   * Situação atual da atividade
   */
  status?: 'pending' | 'completed';
  tenants?: Array<string> | null;

  /**
   * Categoria da atividade ou follow-up (call, meeting, email, task)
   */
  tipo?: 'call' | 'meeting' | 'email' | 'task';

  /**
   * Descrição resumida da atividade ou follow-up
   */
  titulo: string;
}
