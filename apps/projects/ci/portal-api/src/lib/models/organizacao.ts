/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Pessoa } from '../models/pessoa';
import { Photo } from '../models/photo';
import { Tenant } from '../models/tenant';
export interface Organizacao {
  cnpj?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Logomarca da Organização
   */
  logo?: Photo | null;

  /**
   * Nome da Organização
   */
  organizatioName?: string | null;
  ownerUserId?: string | null;

  /**
   * Pessoa Responsável pelo cadastro da Organização na Plataforma virtual.
   */
  responsavel?: Pessoa | null;

  /**
   * Identificador do Inquilino
   */
  tenant?: Tenant | null;
  tenantId?: string | null;
  tenants?: Array<string> | null;
  website?: string | null;
}
