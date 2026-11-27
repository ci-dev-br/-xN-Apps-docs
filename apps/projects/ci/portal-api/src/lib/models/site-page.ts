/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Website } from '../models/website';
export interface SitePage {

  /**
   * Autor ou departamento responsável
   */
  author?: string | null;

  /**
   * Categoria ou seção institucional da página
   */
  category?: string | null;

  /**
   * Conteúdo HTML da página
   */
  content?: Array<string> | null;

  /**
   * Tipo MIME da resposta HTTP (ex: text/html)
   */
  contentType?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição ou resumo SEO da página
   */
  excerpt?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Data de publicação da página
   */
  publishedAt?: string | null;

  /**
   * Identificador amigável da página
   */
  slug?: string | null;

  /**
   * Estado de publicação da página
   */
  status?: ('publicado' | 'rascunho' | 'revisao' | 'agendado') | null;

  /**
   * Nome do template aplicado na renderização da página
   */
  tempalte?: string | null;
  tenants?: Array<string> | null;

  /**
   * Título da página institucional
   */
  title?: string | null;

  /**
   * Endereço público da página (ex: /sobre-nos)
   */
  urlMatch?: string | null;

  /**
   * Contador de visualizações da página
   */
  views?: number | null;

  /**
   * Website correspondente
   */
  website?: Website | null;
}
