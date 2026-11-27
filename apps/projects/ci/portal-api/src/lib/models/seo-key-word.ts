/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { SeoDomain } from '../models/seo-domain';
export interface SeoKeyWord {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Índice de dificuldade de ranqueamento (0 a 100)
   */
  dificuldadeClassificacao?: number | null;

  /**
   * Domínio associado a esta palavra-chave
   */
  dominio?: SeoDomain | null;

  /**
   * Pontuação ou código de intenção de busca
   */
  intencaoPesquisa?: number | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Posição anterior registrada no SERP
   */
  posicaoAnterior?: number | null;

  /**
   * Posição atual nos resultados de busca
   */
  posicaoAtual?: number | null;
  tenants?: Array<string> | null;

  /**
   * Expressão ou palavra-chave monitorada
   */
  termo?: string | null;

  /**
   * Volume mensal estimado de buscas
   */
  voulePesquisa?: number | null;
}
