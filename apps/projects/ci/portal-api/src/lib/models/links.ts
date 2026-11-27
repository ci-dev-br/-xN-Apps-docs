/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Website } from '../models/website';
export interface Links {

  /**
   * Contagem de acessos ao link
   */
  clicks?: number | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição do link ou redirecionamento
   */
  description?: string | null;

  /**
   * URL da imagem ou ícone associado
   */
  image?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Título ou rótulo do link
   */
  name?: string | null;

  /**
   * Anotações internas sobre o link
   */
  notes?: string | null;

  /**
   * Responsável pelo link
   */
  owner?: string | null;

  /**
   * Prioridade ou avaliação do link
   */
  rating?: string | null;

  /**
   * Atributo rel de SEO/relacionamento (nofollow, noopener)
   */
  rel?: string | null;

  /**
   * URL do feed RSS associado
   */
  rss?: string | null;

  /**
   * Identificador curto para redirecionamento
   */
  slug?: string | null;

  /**
   * Alvo de abertura (_blank, _self)
   */
  target?: string | null;
  tenants?: Array<string> | null;

  /**
   * Referência da última atualização
   */
  update?: string | null;

  /**
   * URL de destino do link
   */
  url?: string | null;

  /**
   * Define se o link está visível publicamente (Y/N)
   */
  visible?: string | null;

  /**
   * Website associado ao link
   */
  website?: Website | null;
}
