/* tslint:disable */
/* eslint-disable */
export interface ObterDashboardCrmDto {

  /**
   * Indica se oportunidades marcadas como perdidas devem ser incluídas na listagem
   */
  incluirPerdidas?: boolean | null;

  /**
   * Filtro opcional pelo nome do responsável no funil (ou "Todos")
   */
  responsavel?: string | null;

  /**
   * ID único opcional de tenant para segmentação
   */
  tenantId?: string | null;

  /**
   * Lista opcional de IDs de tenants para segmentação da visão do dashboard
   */
  tenantIds?: Array<string> | null;
}
