/* tslint:disable */
/* eslint-disable */
import { Buffer } from '../models/buffer';
import { ChaveAcesso } from '../models/chave-acesso';
export interface Photo {
  createdAt?: string | null;
  createdBy?: ChaveAcesso | null;
  internalId?: string | null;
  lastModifiedAt?: string | null;
  lastModifiedBy?: ChaveAcesso | null;
  originalFile?: Buffer | null;
  tenants?: Array<string> | null;
}
