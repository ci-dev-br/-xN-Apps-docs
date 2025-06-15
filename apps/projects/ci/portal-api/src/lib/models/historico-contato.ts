/* tslint:disable */
/* eslint-disable */
export interface HistoricoContato {
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataHora: Date;
  deleted?: boolean | null;
  detalhes: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  responsavel: string | null;
  tenants?: Array<string> | null;
  tipoContato: 'Telefone' | 'Email' | 'WhatsApp' | 'Presencial';
}
