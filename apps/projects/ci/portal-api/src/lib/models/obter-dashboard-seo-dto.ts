/* tslint:disable */
/* eslint-disable */
export interface ObterDashboardSeoDto {

  /**
   * Filtro opcional pelo internalId do domínio SEO (ou "todos")
   */
  dominioId?: string | null;

  /**
   * Texto opcional para filtrar páginas, palavras-chave, backlinks, campanhas e tarefas
   */
  search?: string | null;

  /**
   * ID único opcional de tenant para segmentação
   */
  tenantId?: string | null;

  /**
   * Lista opcional de IDs de tenants para segmentação da visão do dashboard
   */
  tenantIds?: Array<string> | null;
}
