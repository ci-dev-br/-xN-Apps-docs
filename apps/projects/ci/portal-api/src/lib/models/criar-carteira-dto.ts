/* tslint:disable */
/* eslint-disable */
export interface CriarCarteiraDto {

  /**
   * Cor do tema visual do cartão
   */
  corTema?: string;

  /**
   * Descrição ou finalidade da carteira
   */
  descricao?: string;

  /**
   * Fator de conversão / cotação de referência em BRL (1 unidade = X R$)
   */
  fatorConversaoBrl?: number;

  /**
   * Limite operacional diário desejado
   */
  limiteDiario?: number;

  /**
   * Código da moeda real ou parametrizada
   */
  moeda?: string;

  /**
   * Nome ou apelido da carteira
   */
  nome?: string;

  /**
   * Nome descritivo do ativo/moeda de lastro
   */
  nomeMoeda?: string;

  /**
   * Parâmetros adicionais do lastro parametrizado
   */
  parametrosLastro?: {
};

  /**
   * Definir como carteira principal
   */
  principal?: boolean;

  /**
   * Saldo / posição inicial de abertura da carteira
   */
  saldoInicial?: number;

  /**
   * Símbolo de exibição da moeda/unidade
   */
  simboloMoeda?: string;

  /**
   * Aceite dos termos de uso da carteira
   */
  termosAceitos?: boolean;

  /**
   * Tipo de lastro: MOEDA_REAL ou PARAMETRIZADA
   */
  tipoLastro?: 'MOEDA_REAL' | 'PARAMETRIZADA';
}
