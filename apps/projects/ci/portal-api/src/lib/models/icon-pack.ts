/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Icon } from '../models/icon';
export interface IconPack {

  /**
   * Pasta base nos assets públicos (ex: icons/v2).
   */
  basePath?: string | null;

  /**
   * Identificador único do pacote de ícones (ex: v2, v3, gerencial, custom).
   */
  code: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição da finalidade e estilo visual do pacote.
   */
  description?: string | null;

  /**
   * Ícones pertencentes ao pacote.
   */
  icons?: Array<Icon> | null;
  internalId?: string | null;

  /**
   * Indica se o pacote está ativo para registro automático no cliente.
   */
  isActive?: boolean | null;

  /**
   * Indica se é o pacote padrão da aplicação.
   */
  isDefault?: boolean | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Identificadores de ações da interface vinculados a este pacote.
   */
  linkedActions?: Array<string> | null;

  /**
   * Nome amigável do pacote de ícones.
   */
  name?: string | null;

  /**
   * Lista de chaves de aplicativos vinculados a este pacote.
   */
  targetApps?: Array<string> | null;
  tenants?: Array<string> | null;

  /**
   * Versão semântica do pacote de ícones.
   */
  version?: string | null;
}
