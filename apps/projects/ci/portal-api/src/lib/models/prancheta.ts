/* tslint:disable */
/* eslint-disable */
import { Card } from '../models/card';
import { Credential } from '../models/credential';
export interface Prancheta {
  cards?: Array<Card> | null;

  /**
   * Código interno para prancheta Padrão, permite compartilhar a prancheta internamente entre usuários a partir de seu código global
   */
  codigoGlobal?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  layout?: any | null;
  order?: number | null;

  /**
   * Escopo de compartilhamento: USER (apenas criador) ou TENANT (todos os membros do tenant)
   */
  scope?: ('USER' | 'TENANT') | null;
  tenants?: Array<string> | null;
  title?: string | null;
}
