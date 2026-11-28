/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Instrutor {

  /**
   * Mini currículo e experiência do instrutor
   */
  biografia?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * E-mail de contato do instrutor
   */
  email?: string | null;

  /**
   * Área principal de atuação do instrutor
   */
  especialidade?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Nome completo do instrutor
   */
  nome?: string | null;

  /**
   * Telefone de contato
   */
  telefone?: string | null;
  tenants?: Array<string> | null;

  /**
   * ID do usuário proprietário deste perfil de instrutor
   */
  userId?: string | null;
}
