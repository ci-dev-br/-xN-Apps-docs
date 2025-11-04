/* tslint:disable */
/* eslint-disable */
import { ClienteProjeto } from '../models/cliente-projeto';
export interface Projeto {

  /**
   * Cliente
   */
  cliente: ClienteProjeto | null;

  /**
   * Controle de Versão
   */
  controleVersao?: string | null;
  createdAt?: Date | null;
  createdBy?: {
} | null;

  /**
   * Data de Início
   */
  dataInicio?: string | null;
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
