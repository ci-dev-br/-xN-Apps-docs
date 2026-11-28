/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Curso } from '../models/curso';
export interface Turma {
  createdAt?: Date | null;
  createdBy?: Credential | null;

  /**
   * Curso vinculado à turma
   */
  curso?: Curso | null;

  /**
   * Identificador interno do curso associado
   */
  cursoId?: string | null;

  /**
   * Data e hora de término
   */
  dataFim?: Date | null;

  /**
   * Data e hora de início
   */
  dataInicio?: Date | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Endereço físico ou link da sala virtual
   */
  localOuLink?: string | null;

  /**
   * Identificação da turma (ex: Turma Novembro 2026)
   */
  nome?: string | null;

  /**
   * Estado da turma (Planejada, Aberta, Em Andamento, Concluída, Cancelada)
   */
  status?: string | null;
  tenants?: Array<string> | null;

  /**
   * Quantidade de vagas abertas
   */
  vagasDisponiveis?: number | null;
}
