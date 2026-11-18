/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface Block {

  /**
   * ID da aplicação cadastrada associada a este bloco
   */
  applicationId?: string | null;

  /**
   * Conteúdo JSON da construção da tela em blocos
   */
  code?: {
} | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;

  /**
   * Descrição da finalidade da tela ou bloco
   */
  description?: string | null;
  internalId?: string | null;

  /**
   * Linguagem ou formato da especificação do bloco (ex: dynamic-blocks-json)
   */
  lang?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Nome identificador do bloco ou tela dinâmica
   */
  name?: string | null;

  /**
   * Rota da aplicação relacionada a esta tela em blocos
   */
  route?: string | null;
  tenants?: Array<string> | null;
}
