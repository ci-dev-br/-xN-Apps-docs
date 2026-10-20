/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface LancamentoFinanceiro {
  categoria?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  tenants?: Array<string> | null;

  /**
   * Valor incial do Lançameto
   */
  valor?: number | null;
}
