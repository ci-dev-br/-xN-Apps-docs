/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { SitePost } from '../models/site-post';
import { Website } from '../models/website';
export interface Comment {

  /**
   * Nome do autor do comentário
   */
  author?: string | null;

  /**
   * Endereço de e-mail do autor
   */
  authorEmail?: string | null;

  /**
   * Endereço IP de origem do comentário
   */
  authorIp?: string | null;

  /**
   * Site ou perfil público do autor
   */
  authorUrl?: string | null;

  /**
   * Texto do comentário enviado pelo leitor
   */
  content?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Comentário original quando for uma resposta
   */
  parent?: Comment | null;

  /**
   * Post ao qual o comentário pertence
   */
  post?: SitePost | null;

  /**
   * Data e hora de publicação do comentário
   */
  publishingAt?: string | null;

  /**
   * Estado de moderação do comentário
   */
  status?: ('pendente' | 'aprovado' | 'spam' | 'lixeira') | null;
  tenants?: Array<string> | null;

  /**
   * Website associado ao comentário
   */
  website?: Website | null;
}
