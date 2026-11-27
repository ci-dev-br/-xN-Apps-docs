/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { SeoCampanha } from '../models/seo-campanha';
import { SeoDomain } from '../models/seo-domain';
import { SeoIssue } from '../models/seo-issue';
import { SeoKeyWord } from '../models/seo-key-word';
export interface SeoPage {

  /**
   * Campanha de SEO vinculada à página
   */
  campanha?: SeoCampanha | null;

  /**
   * Valor da tag link rel="canonical"
   */
  canonical?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Domínio ao qual a página pertence
   */
  dominio?: SeoDomain | null;

  /**
   * Indica se a página permite indexação por mecanismos de busca
   */
  indexavel?: boolean | null;
  internalId?: string | null;

  /**
   * Lista de apontamentos identificados na auditoria on-page
   */
  issues?: Array<SeoIssue> | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Descrição meta da página
   */
  metaDescription?: string | null;

  /**
   * Palavras-chave alvo associadas a esta página
   */
  palavrasChave?: Array<SeoKeyWord> | null;

  /**
   * Pontuação on-page de 0 a 100
   */
  score?: number | null;

  /**
   * Código de resposta HTTP da última auditoria
   */
  statusHttp?: number | null;

  /**
   * Latência medida na última auditoria em milissegundos
   */
  tempoRespostaMs?: number | null;
  tenants?: Array<string> | null;

  /**
   * Título extraído da tag <title> na última auditoria
   */
  titulo?: string | null;

  /**
   * Data e hora da última auditoria executada
   */
  ultimaAuditoria?: string | null;

  /**
   * URL completa da página monitorada
   */
  url?: string | null;
}
