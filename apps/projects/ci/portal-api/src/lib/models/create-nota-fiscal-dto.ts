/* tslint:disable */
/* eslint-disable */
export interface CreateNotaFiscalDto {

  /**
   * CNPJ do prestador (sua empresa)
   */
  cnpjPrestador: string;

  /**
   * CNPJ do tomador (cliente)
   */
  cnpjTomador: string;

  /**
   * Descrição detalhada
   */
  descricaoServico: string;

  /**
   * Valor total do serviço ou produto
   */
  valorTotal: number;
}
