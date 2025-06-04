/* tslint:disable */
/* eslint-disable */
export interface Promocao {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataFim: string | null;
  dataInicio: string | null;
  descontoPercentual: number | null;
  descontoValor: number | null;
  descricao: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  nome: string;

  /**
   * Lista de IDs de serviços aplicáveis (separados por vírgula)
   */
  servicosAplicaveis: string | null;
  tenants?: Array<string> | null;
}
