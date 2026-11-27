/* tslint:disable */
/* eslint-disable */
export interface Source {
  consecutiveErrors?: number | null;
  createdAt?: string | null;

  /**
   * Domínio da fonte (ex: techtudo.com.br)
   */
  domain?: string | null;
  id?: string | null;
  name?: string | null;

  /**
   * URL do feed RSS
   */
  searchUrlTemplate?: string | null;
  status?: ('DISCOVERED' | 'SANDBOX' | 'ACTIVE' | 'SUSPENDED') | null;
  successfulRequests?: number | null;

  /**
   * Se false, o robô vai baixar o feed todo e filtrar no código
   */
  supportsSearch?: boolean;
  totalRequests?: number;
  updatedAt?: string | null;
}
