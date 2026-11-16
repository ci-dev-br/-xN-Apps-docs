/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface LancamentoFinanceiro {
  categoria?: string | null;

  /**
   * Código interno do sistema gerador do Documento
   */
  codigoBarras?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição do lançamento
   */
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  mesReferencia?: Date | null;
  status?: string | null;
  tenants?: Array<string> | null;

  /**
   * Valor incial do Lançameto
   */
  valor?: number | null;
}
