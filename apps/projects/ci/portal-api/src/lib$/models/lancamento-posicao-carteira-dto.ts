/* tslint:disable */
/* eslint-disable */
export interface LancamentoPosicaoCarteiraDto {

  /**
   * ID da carteira a ser atualizada
   */
  carteiraId?: string;

  /**
   * Categoria do lançamento
   */
  categoria?: 'DEPOSITO' | 'PAGAMENTO_FATURA' | 'TRANSFERENCIA' | 'ESTORNO' | 'AJUSTE_POSICAO' | 'RENDIMENTO' | 'APORTE' | 'RETIRADA' | 'VALORIZACAO' | 'OUTROS';

  /**
   * Descrição / justificativa da atualização de posição
   */
  descricao?: string;

  /**
   * Identificador ou documento de referência
   */
  identificador?: string;

  /**
   * Metadados adicionais do lançamento
   */
  metadados?: {
};

  /**
   * Modo de lançamento: MOVIMENTACAO (entrada/saída) ou DEFINIR_POSICAO (ajuste direto do saldo atual)
   */
  modo: 'MOVIMENTACAO' | 'DEFINIR_POSICAO';

  /**
   * Nova cotação / fator de conversão em BRL (opcional)
   */
  novaCotacaoBrl?: number;

  /**
   * Nova meta de posição da carteira (opcional)
   */
  novaMetaPosicao?: number;

  /**
   * Nova posição / saldo consolidado quando modo = DEFINIR_POSICAO
   */
  novaPosicao?: number;

  /**
   * Tipo da movimentação quando modo = MOVIMENTACAO
   */
  tipo?: 'ENTRADA' | 'SAIDA';

  /**
   * Valor da movimentação quando modo = MOVIMENTACAO
   */
  valor?: number;
}
