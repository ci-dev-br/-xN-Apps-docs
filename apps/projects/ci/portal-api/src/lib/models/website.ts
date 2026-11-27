/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { User } from '../models/user';
export interface Website {

  /**
   * Usuário administrador principal do website
   */
  admin?: User | null;

  /**
   * Metadados e atributos personalizados do website
   */
  atributes?: {
} | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição institucional do portal
   */
  description?: string | null;

  /**
   * Domínio ou host público do website
   */
  domain?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Lista de módulos ativos neste website
   */
  modules?: Array<string> | null;

  /**
   * Nome identificador do website ou portal
   */
  name?: string | null;
  tenants?: Array<string> | null;

  /**
   * Identificador do tema visual aplicado ao portal
   */
  theme?: string | null;

  /**
   * Usuários com permissão de gestão de conteúdo
   */
  users?: Array<User> | null;
}
