/* tslint:disable */
/* eslint-disable */
export interface Produto {
  categoria: string | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  descricao: string | null;
  estoque: number;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  marca: string | null;
  nome: string;
  precoCusto: number;
  precoVenda: number;
  tenants?: Array<string> | null;
}
