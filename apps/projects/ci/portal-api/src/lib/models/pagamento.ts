/* tslint:disable */
/* eslint-disable */
export interface Pagamento {
  agendamentoId: number | null;
  atendimentoId: number | null;
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataPagamento: string;
  formaPagamento: 'Dinheiro' | 'Cart\xE3o de Cr\xE9dito' | 'Cart\xE3o de D\xE9bito' | 'Pix' | 'Outro';
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  numeroTransacao: string | null;
  status: {
};
  tenants?: Array<string> | null;
  valor: number;
  vendaProdutoId: number | null;
}
