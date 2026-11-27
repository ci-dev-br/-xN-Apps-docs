/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Website } from '../models/website';
export interface Term {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição detalhada do termo ou categoria
   */
  description?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Nome de exibição do termo ou categoria
   */
  name?: string | null;

  /**
   * Identificador amigável para URL
   */
  slug?: string | null;

  /**
   * Classificação do termo (category, tag, nav_menu)
   */
  taxonomy?: ('category' | 'tag' | 'nav_menu') | null;
  tenants?: Array<string> | null;

  /**
   * Agrupamento lógico do termo
   */
  termGroup?: string | null;

  /**
   * Website associado ao termo
   */
  website?: Website | null;
}
