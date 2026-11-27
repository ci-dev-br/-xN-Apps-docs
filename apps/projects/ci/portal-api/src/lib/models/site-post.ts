/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Term } from '../models/term';
import { Website } from '../models/website';
export interface SitePost {

  /**
   * Autor ou equipe editorial responsável
   */
  author?: string | null;

  /**
   * Categoria editorial principal
   */
  category?: string | null;

  /**
   * Blocos de conteúdo HTML ou Markdown da publicação
   */
  content?: Array<string> | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Breve introdução exibida nas listagens e cards
   */
  excerpt?: string | null;

  /**
   * URL da imagem destacada da publicação
   */
  featuredImage?: string | null;

  /**
   * Identificador global único da publicação
   */
  guid?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Posição de ordenação editorial
   */
  menuOrder?: number | null;

  /**
   * Data e hora de publicação ou agendamento
   */
  publishedAt?: string | null;

  /**
   * Identificador amigável de URL
   */
  slug?: string | null;

  /**
   * Estado editorial da publicação
   */
  status?: ('publicado' | 'rascunho' | 'revisao' | 'agendado') | null;
  tenants?: Array<string> | null;

  /**
   * Categorias e tags associadas à publicação
   */
  terms?: Array<Term> | null;

  /**
   * Título principal da publicação
   */
  title?: string | null;

  /**
   * Classificação da publicação (post, page, notice)
   */
  type?: ('post' | 'page' | 'notice') | null;

  /**
   * Contador de visualizações da publicação
   */
  views?: number | null;

  /**
   * Website onde a publicação será exibida
   */
  website?: Website | null;
}
