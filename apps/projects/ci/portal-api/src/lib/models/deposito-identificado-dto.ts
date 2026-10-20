/* tslint:disable */
/* eslint-disable */
export interface DepositoIdentificadoDto {

  /**
   * Descrição da operação
   */
  descricao?: string;

  /**
   * Identificador do depósito (ex: comprovante, código pix)
   */
  identificador?: string;

  /**
   * Metadados adicionais da transação
   */
  metadados?: {
};

  /**
   * Valor a ser depositado na carteira (em R$)
   */
  valor: number;
}
