/* tslint:disable */
/* eslint-disable */
export interface SolicitarVerificacaoEmailOutputDto {

  /**
   * Indica se o e-mail já estava verificado
   */
  alreadyVerified?: boolean | null;

  /**
   * Endereço de e-mail destinatário
   */
  email?: string | null;

  /**
   * Mensagem informativa do resultado
   */
  message?: string | null;

  /**
   * Indica se o e-mail de verificação foi enviado
   */
  sent: boolean;
}
