/* tslint:disable */
/* eslint-disable */
export interface ToggleUserActivationDto {

  /**
   * Estado desejado da ativação (se omitido, inverte o estado atual)
   */
  active?: boolean;

  /**
   * Chave da aplicação
   */
  appKey?: string;

  /**
   * ID da aplicação
   */
  applicationId?: string;
}
