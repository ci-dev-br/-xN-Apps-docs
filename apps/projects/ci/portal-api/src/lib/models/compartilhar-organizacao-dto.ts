/* tslint:disable */
/* eslint-disable */
export interface CompartilharOrganizacaoDto {

  /**
   * E-mail ou username do usuário destino
   */
  emailOrUsername?: string | null;

  /**
   * Roles com prefixo ORG atribuídos ao usuário
   */
  roles?: Array<string>;

  /**
   * ID do usuário destino
   */
  userId?: string | null;
}
