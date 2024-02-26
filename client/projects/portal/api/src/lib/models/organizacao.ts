/* tslint:disable */
/* eslint-disable */
import { AccessCredential } from '../models/access-credential';
import { Pessoa } from '../models/pessoa';
import { Photo } from '../models/photo';
import { Tenant } from '../models/tenant';
export interface Organizacao {
  cadastroPessoa?: Pessoa | null;
  createdAt?: string | null;
  createdBy?: AccessCredential | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: AccessCredential | null;

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
