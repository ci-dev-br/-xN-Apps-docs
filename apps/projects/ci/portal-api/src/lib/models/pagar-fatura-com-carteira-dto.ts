/* tslint:disable */
/* eslint-disable */
export interface PagarFaturaComCarteiraDto {

  /**
   * ID da carteira pagadora (opcional; usa a principal caso omitido)
   */
  carteiraId?: string;

  /**
   * Descrição do pagamento
   */
  descricao?: string;

  /**
   * Identificador único da fatura a ser liquidada
   */
  faturaId: string;

  /**
   * Metadados adicionais da fatura
   */
  metadados?: {
};

  /**
   * Valor da fatura a ser debitado da carteira
   */
  valor: number;
}
