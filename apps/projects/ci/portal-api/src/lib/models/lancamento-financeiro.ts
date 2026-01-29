/* tslint:disable */
/* eslint-disable */
export interface LancamentoFinanceiro {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  tenants?: Array<string> | null;

  /**
   * Valor incial de do Lançameto
   */
  valor?: number | null;
}
