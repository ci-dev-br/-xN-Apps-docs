/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
import { Curso } from '../models/curso';
import { Turma } from '../models/turma';
export interface Matricula {

  /**
   * E-mail do aluno matriculado
   */
  alunoEmail?: string | null;

  /**
   * Nome do colaborador/aluno matriculado
   */
  alunoNome?: string | null;

  /**
   * Lista de internalIds de aulas concluídas
   */
  aulasConcluidasIds?: Array<string> | null;

  /**
   * Hash de autenticidade do certificado emitido
   */
  certificadoCodigo?: string | null;

  /**
   * Data em que o certificado foi emitido
   */
  certificadoEmitidoEm?: string | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;

  /**
   * Curso matriculado
   */
  curso?: Curso | null;

  /**
   * Identificador do curso matriculado
   */
  cursoId?: string | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Indica confirmação de presença na turma
   */
  presencaConfirmada?: boolean | null;

  /**
   * Percentual de conclusão do curso (0-100)
   */
  progresso?: number | null;

  /**
   * Status da matrícula (Pendente, Confirmada, Cancelada)
   */
  status?: string | null;
  tenants?: Array<string> | null;

  /**
   * Turma associada à matrícula
   */
  turma?: Turma | null;

  /**
   * ID da última aula assistida
   */
  ultimaAulaId?: string | null;

  /**
   * Mapa aulaId -> segundos assistidos para retomada do player
   */
  ultimoTempoPorAula?: {
} | null;

  /**
   * Identificador do usuário matriculado
   */
  userId?: string | null;
}
