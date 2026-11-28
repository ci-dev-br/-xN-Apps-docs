/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface AnotacaoEstudo {

  /**
   * Identificador da aula relacionada
   */
  aulaId?: string | null;

  /**
   * Nome da aula para exibição rápida
   */
  aulaTitulo?: string | null;

  /**
   * Texto completo, código ou resumo da aula
   */
  conteudo?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;

  /**
   * Identificador do curso relacionado
   */
  cursoId?: string | null;

  /**
   * Nome do curso para exibição rápida
   */
  cursoTitulo?: string | null;
  deleted?: boolean | null;

  /**
   * Assunto ou trilha da anotação
   */
  disciplina?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Palavras-chave da anotação
   */
  tags?: Array<string> | null;
  tenants?: Array<string> | null;

  /**
   * Tempo formatado no vídeo (ex: 04:15)
   */
  timestampLabel?: string | null;

  /**
   * Posição exata do vídeo em segundos quando a anotação foi feita
   */
  timestampSegundos?: number | null;

  /**
   * Título da anotação ou resumo
   */
  titulo?: string | null;

  /**
   * Autor da anotação
   */
  userId?: string | null;
}
