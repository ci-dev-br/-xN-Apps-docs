/* tslint:disable */
/* eslint-disable */
import { Aula } from '../models/aula';
import { Credential } from '../models/credential';
import { Instrutor } from '../models/instrutor';
import { Turma } from '../models/turma';
export interface Curso {

  /**
   * Lista de aulas em vídeo e materiais do curso
   */
  aulas?: Array<Aula> | null;

  /**
   * Carga horária total em horas
   */
  cargaHoraria?: number | null;

  /**
   * Cor hexadecimal de destaque do card
   */
  corCapa?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Resumo de apresentação do curso
   */
  descricao?: string | null;

  /**
   * Conteúdo programático e objetivos pedagógicos
   */
  ementa?: string | null;

  /**
   * Nome do ícone Material exibido no card
   */
  icone?: string | null;

  /**
   * Instrutor responsável pelo treinamento
   */
  instrutor?: Instrutor | null;

  /**
   * Nome de exibição do instrutor
   */
  instrutorNome?: string | null;

  /**
   * Identificador do usuário criador/instrutor
   */
  instrutorUserId?: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Nível de dificuldade (Iniciante, Intermediário, Avançado)
   */
  nivel?: string | null;

  /**
   * Valor base do treinamento
   */
  precoBase?: number | null;

  /**
   * Indica se o treinamento está visível para alunos
   */
  publicado?: boolean | null;

  /**
   * Nota média do treinamento
   */
  rating?: number | null;
  tenants?: Array<string> | null;

  /**
   * Título do treinamento
   */
  titulo?: string | null;

  /**
   * Trilha de conhecimento do treinamento
   */
  trilha?: string | null;

  /**
   * Turmas e sessões agendadas para o curso
   */
  turmas?: Array<Turma> | null;
}
