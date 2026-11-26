/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface HistoricoContato {
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataHora: Date;
  deleted?: boolean | null;
  detalhes: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  responsavel: string | null;
  tenants?: Array<string> | null;
  tipoContato: 'Telefone' | 'Email' | 'WhatsApp' | 'Presencial';
}
