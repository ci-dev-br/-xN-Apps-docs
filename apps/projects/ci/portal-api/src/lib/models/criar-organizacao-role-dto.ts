/* tslint:disable */
/* eslint-disable */
export interface CriarOrganizacaoRoleDto {
  description?: string | null;

  /**
   * Nome personalizado do role (receberá prefixo ORG se não informado)
   */
  name: string;
}
