/* tslint:disable */
/* eslint-disable */
export interface LancamentoFinanceiro {
  categoria?: string | null;
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
   * Valor incial do Lançameto
   */
  valor?: number | null;
}
