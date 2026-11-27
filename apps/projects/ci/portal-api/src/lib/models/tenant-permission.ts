/* tslint:disable */
/* eslint-disable */
import { Tenant } from '../models/tenant';
export interface TenantPermission {

  /**
   * Permite compartilhar o tenant e gerenciar permissões
   */
  canCompartilhar: boolean;

  /**
   * Permite editar e criar dados no tenant
   */
  canEditar: boolean;

  /**
   * Permite ver detalhes e registros vinculados ao tenant
   */
  canVer: boolean;

  /**
   * Permite visualizar o tenant nas listagens e filtros
   */
  canVisualizar: boolean;
  createdAt: string | null;

  /**
   * ID do usuário que concedeu a permissão
   */
  grantedBy?: string | null;
  id: string;

  /**
   * ID da organização associada à permissão
   */
  organizacaoId?: string | null;

  /**
   * Role opcional associada à permissão
   */
  role?: string | null;
  tenant?: Tenant | null;

  /**
   * ID do Tenant ao qual a permissão se aplica
   */
  tenantId: string;
  updatedAt: string | null;

  /**
   * ID do usuário beneficiário da permissão
   */
  userId?: string | null;
}
