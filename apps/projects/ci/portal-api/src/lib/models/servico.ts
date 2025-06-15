/* tslint:disable */
/* eslint-disable */
export interface Servico {
  categoria: string | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  descricao: string | null;
  duracaoEstimada: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  nome: string;
  preco: number;
  tenants?: Array<string> | null;
}
