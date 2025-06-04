/* tslint:disable */
/* eslint-disable */
export interface Agendamento {
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataHora: string;
  duracao: string;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  observacoes: string | null;
  profissionalId: number;
  servicoId: number;
  status: 'Agendado' | 'Confirmado' | 'Cancelado' | 'Conclu\xEDdo';
  tenants?: Array<string> | null;
  valor: number;
}
