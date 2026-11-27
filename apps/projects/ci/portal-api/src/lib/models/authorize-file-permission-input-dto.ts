/* tslint:disable */
/* eslint-disable */
export interface AuthorizeFilePermissionInputDto {

  /**
   * Decisão do SYSADMIN (GRANT ou DENY)
   */
  decision?: 'GRANT' | 'DENY';

  /**
   * Identificador interno da permissão
   */
  internalId?: string | null;

  /**
   * Token único recebido no e-mail de autorização
   */
  token?: string | null;
}
