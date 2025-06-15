/* tslint:disable */
/* eslint-disable */
export interface Atendimento {
  agendamentoId: number;
  anotacoes: string | null;
  avaliacaoCliente: number | null;
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataFim: string;
  dataInicio: Date;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  profissionalId: number;
  servicoId: number;
  tenants?: Array<string> | null;
}
