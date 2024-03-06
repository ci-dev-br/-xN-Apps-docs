/* tslint:disable */
/* eslint-disable */
import { ChaveAcesso } from '../models/chave-acesso';
import { Pessoa } from '../models/pessoa';
import { Photo } from '../models/photo';
import { Tenant } from '../models/tenant';
export interface Organizacao {
  cadastroPessoa?: Pessoa | null;
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;

  /**
   * Logomarca da Organização
   */
  logo?: Photo | null;

  /**
   * Nome da Organização
   */
  organizatioName?: string | null;
  tenant?: Tenant | null;
  tenants?: Array<string> | null;
}
