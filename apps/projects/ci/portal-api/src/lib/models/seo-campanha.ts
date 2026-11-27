/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { SeoDomain } from '../models/seo-domain';
export interface SeoCampanha {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Domínio principal da campanha
   */
  dominio?: SeoDomain | null;
  fim?: string | null;
  inicio?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Título identificador da campanha de SEO
   */
  nome?: string | null;

  /**
   * Meta principal da campanha orgânica
   */
  objetivo?: string | null;

  /**
   * Situação atual da campanha
   */
  status?: ('PLANEJADA' | 'ATIVA' | 'PAUSADA' | 'CONCLUIDA') | null;
  tenants?: Array<string> | null;
}
