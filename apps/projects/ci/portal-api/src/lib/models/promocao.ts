/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Promocao {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataFim: Date | null;
  dataInicio: Date | null;
  deleted?: boolean | null;
  descontoPercentual: number | null;
  descontoValor: number | null;
  descricao: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  nome: string;

  /**
   * Lista de IDs de serviços aplicáveis (separados por vírgula)
   */
  servicosAplicaveis: string | null;
  tenants?: Array<string> | null;
}
