/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Pagamento {
  agendamentoId: number | null;
  atendimentoId: number | null;
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataAtualizacao: Date;
  dataCriacao: Date;
  dataPagamento: Date;
  deleted?: boolean | null;
  formaPagamento: 'Dinheiro' | 'Cart\xE3o de Cr\xE9dito' | 'Cart\xE3o de D\xE9bito' | 'Pix' | 'Outro';
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  numeroTransacao: string | null;
  status: {
};
  tenants?: Array<string> | null;
  valor: number;
  vendaProdutoId: number | null;
}
