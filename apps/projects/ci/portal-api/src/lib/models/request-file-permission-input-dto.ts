/* tslint:disable */
/* eslint-disable */
export interface RequestFilePermissionInputDto {

  /**
   * URL de origem para compor o link de autorização
   */
  originUrl?: string | null;

  /**
   * Caminho da pasta para a qual se solicita permissão
   */
  path: string;

  /**
   * Justificativa da solicitação de acesso
   */
  reason?: string | null;
}
