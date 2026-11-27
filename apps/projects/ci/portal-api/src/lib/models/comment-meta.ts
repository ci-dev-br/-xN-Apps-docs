/* tslint:disable */
/* eslint-disable */
import { Comment } from '../models/comment';
import { Credential } from '../models/credential';
export interface CommentMeta {

  /**
   * Comentário associado ao metadado
   */
  comment?: Comment | null;
  createdAt?: Date | null;
  createdBy?: Credential | null;
  deleted?: boolean | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;

  /**
   * Chave identificadora do metadado
   */
  metaKey?: string | null;

  /**
   * Valor do metadado do comentário
   */
  metaValue?: string | null;
  tenants?: Array<string> | null;
}
