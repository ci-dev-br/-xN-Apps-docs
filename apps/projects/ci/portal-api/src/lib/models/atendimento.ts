/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Atendimento {
  agendamentoId: number;
  anotacoes: string | null;
  avaliacaoCliente: number | null;
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataFim: string;
  dataInicio: Date;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  profissionalId: number;
  servicoId: number;
  tenants?: Array<string> | null;
}
