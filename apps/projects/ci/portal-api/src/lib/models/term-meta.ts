/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Term } from '../models/term';
export interface TermMeta {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;

  /**
   * Chave do metadado
   */
  key?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Identificador auxiliar do metadado
   */
  metaId?: string | null;
  tenants?: Array<string> | null;

  /**
   * Termo relacionado
   */
  term?: Term | null;

  /**
   * Valor do metadado
   */
  value?: string | null;
}
