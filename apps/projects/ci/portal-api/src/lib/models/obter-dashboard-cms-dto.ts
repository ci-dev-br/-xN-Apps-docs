/* tslint:disable */
/* eslint-disable */
export interface ObterDashboardCmsDto {

  /**
   * Texto opcional para filtrar por título, categoria ou slug
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

  /**
   * Filtro opcional por tipo de conteúdo (todos, post, page, notice)
   */
  type?: ('todos' | 'post' | 'page' | 'notice') | null;

  /**
   * Filtro opcional pelo internalId do website
   */
  websiteId?: string | null;
}
