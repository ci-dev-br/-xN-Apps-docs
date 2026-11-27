/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Website } from '../models/website';
export interface SiteOption {

  /**
   * Indica se a opção é carregada automaticamente no bootstrap do site
   */
  autoload?: boolean | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição da finalidade desta opção
   */
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Chave identificadora da configuração
   */
  optionName?: string | null;

  /**
   * Valor serializado ou textual da configuração
   */
  optionValue?: string | null;
  tenants?: Array<string> | null;

  /**
   * Website associado à configuração (opcional para opções globais)
   */
  website?: Website | null;
}
