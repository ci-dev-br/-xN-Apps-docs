/* tslint:disable */
/* eslint-disable */
export interface Tenant {
  createdAt: string | null;

  /**
   * Criador do Tenant
   */
  createdBy: string | null;

  /**
   * Descrição
   */
  descriptions: string | null;
  id: string;

  /**
   * Identificador / Nome do Tenant
   */
  name: string | null;
  updatedAt: string | null;
}
