/* tslint:disable */
/* eslint-disable */
export interface DepositoIdentificadoDto {

  /**
   * ID da carteira de destino (opcional; usa a principal caso omitido)
   */
  carteiraId?: string;

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
   * Valor a ser depositado na carteira
   */
  valor: number;
}
