/* tslint:disable */
/* eslint-disable */
export interface RecordUsageDto {

  /**
   * Chave da aplicação utilizada (ex: Mensagens, Financeiro)
   */
  appKey: string;

  /**
   * Hash da versão do Git informada pelo cliente
   */
  gitVersionHash?: string;

  /**
   * Metadados contextuais da execução
   */
  metadata?: {
};
}
