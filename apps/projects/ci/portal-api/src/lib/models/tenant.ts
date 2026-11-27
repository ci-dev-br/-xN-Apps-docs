/* tslint:disable */
/* eslint-disable */
import { TenantPermission } from '../models/tenant-permission';
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

  /**
   * ID da organização proprietária/vinculada
   */
  organizacaoId?: string | null;
  permissions?: Array<TenantPermission> | null;
  updatedAt: string | null;
}
