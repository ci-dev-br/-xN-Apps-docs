/* tslint:disable */
/* eslint-disable */
import { Cliente } from '../models/cliente';
export interface Projeto {

  /**
   * Cliente
   */
  cliente: Cliente | null;

  /**
   * Controle de Versão
   */
  controleVersao?: string | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  deleted?: boolean | null;

  /**
   * Descrição
   */
  descricao?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;

  /**
   * Nome
   */
  nome?: string | null;
  tenants?: Array<string> | null;

  /**
   * Visibilidade
   */
  visibilidade?: string | null;
}
