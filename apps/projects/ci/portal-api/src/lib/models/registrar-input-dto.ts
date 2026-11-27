/* tslint:disable */
/* eslint-disable */
export interface RegistrarInputDto {

  /**
   * Alias para invite hash
   */
  convite?: string | null;
  email?: string | null;
  emailAuthorization?: boolean | null;
  fullName?: string | null;
  identificacao?: string | null;

  /**
   * Invite hash recebido por e-mail
   */
  invite?: string | null;
  password?: string | null;
  phone?: string | null;
  phoneAuthorization?: boolean | null;

  /**
   * Chave pública do cliente (SPKI base64 ou JWK)
   */
  publicKey?: string | null;

  /**
   * Algoritmo da chave pública do cliente
   */
  publicKeyAlgorithm?: string | null;
  surname?: string | null;
}
