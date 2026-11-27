/* tslint:disable */
/* eslint-disable */
export interface SeoIssue {

  /**
   * Identificador técnico da issue encontrada
   */
  codigo: string;

  /**
   * Descrição da ocorrência de auditoria
   */
  mensagem: string;
  severidade: 'CRITICO' | 'ALERTA' | 'INFO';
}
