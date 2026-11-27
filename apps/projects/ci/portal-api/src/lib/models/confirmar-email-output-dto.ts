/* tslint:disable */
/* eslint-disable */
export interface ConfirmarEmailOutputDto {

  /**
   * Indica se o e-mail já estava confirmado anteriormente
   */
  alreadyVerified?: boolean | null;

  /**
   * Endereço de e-mail confirmado
   */
  email?: string | null;

  /**
   * Mensagem informativa do resultado
   */
  message?: string | null;

  /**
   * Identificador do usuário verificado
   */
  userId?: string | null;

  /**
   * Indica se o e-mail foi confirmado com sucesso
   */
  verified: boolean;
}
