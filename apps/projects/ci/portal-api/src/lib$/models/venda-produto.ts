/* tslint:disable */
/* eslint-disable */
import { Pagamento } from '../models/pagamento';
import { Produto } from '../models/produto';
export interface VendaProduto {
  atendimento: {
};
  atendimentoId: number | null;
  cliente: {
};
  clienteId: number;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  pagamento: Pagamento;
  precoUnitario: number;
  produto: Produto;
  produtoId: number;
  quantidade: number;
  tenants?: Array<string> | null;
}
