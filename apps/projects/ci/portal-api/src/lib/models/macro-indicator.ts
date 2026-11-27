/* tslint:disable */
/* eslint-disable */
export interface MacroIndicator {

  /**
   * Data de referência
   */
  date: string;

  /**
   * Data e hora em que o indicador foi extraído
   */
  extractedAt?: string;

  /**
   * Nome do Indicador (ex: SELIC, IPCA, DOLAR)
   */
  name: string;

  /**
   * Fonte da extração do indicador
   */
  source?: string;

  /**
   * Valor do indicador na data
   */
  value: number;

  /**
   * Variação percentual ou em pontos em relação à leitura anterior
   */
  variation?: number;
}
