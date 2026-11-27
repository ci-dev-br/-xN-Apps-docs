/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { SeoDomain } from '../models/seo-domain';
import { SeoPage } from '../models/seo-page';
export interface SeoTarefa {

  /**
   * Código do problema de origem (ex.: TITLE_MISSING)
   */
  codigoIssue?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Detalhamento técnico da ação corretiva
   */
  descricao?: string | null;
  dominio?: SeoDomain | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  pagina?: SeoPage | null;
  prioridade?: ('BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA') | null;

  /**
   * Nome do responsável pela execução da tarefa
   */
  responsavel?: string | null;
  status?: ('ABERTA' | 'EM_ANDAMENTO' | 'CONCLUIDA') | null;
  tenants?: Array<string> | null;

  /**
   * Resumo da tarefa de otimização SEO
   */
  titulo?: string | null;
}
