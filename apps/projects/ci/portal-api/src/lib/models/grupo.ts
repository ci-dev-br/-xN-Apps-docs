/* tslint:disable */
/* eslint-disable */
import { Tenant } from '../models/tenant';
export interface Grupo {

  /**
   * ID do usuário administrador
   */
  adminId: string;

  /**
   * URL do avatar ou logotipo do grupo
   */
  avatarUrl: string | null;

  /**
   * URL da foto de capa
   */
  coverUrl: string | null;
  createdAt: string | null;

  /**
   * ID do usuário criador
   */
  createdBy: string;

  /**
   * Descrição dos objetivos do grupo
   */
  descriptions: string | null;
  id: string;

  /**
   * Nome / Título do Grupo
   */
  name: string;

  /**
   * Se novos participantes requerem aprovação do administrador
   */
  requiresApproval: boolean;

  /**
   * Tenant associado para compartilhamento de dados entre os membros
   */
  tenant: Tenant;

  /**
   * ID do Tenant associado
   */
  tenantId: string;
  updatedAt: string | null;
}
