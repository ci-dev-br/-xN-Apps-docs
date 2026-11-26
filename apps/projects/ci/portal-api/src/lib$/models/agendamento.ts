/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Agendamento {
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataHora: Date;
  deleted?: boolean | null;
  duracao: string;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  observacoes: string | null;
  profissionalId: number;
  servicoId: number;
  status: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Conclu\xEDdo';
  tenants?: Array<string> | null;
  valor: number;
}
