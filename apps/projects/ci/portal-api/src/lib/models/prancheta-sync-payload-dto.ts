/* tslint:disable */
/* eslint-disable */
import { Prancheta } from '../models/prancheta';
export interface PranchetaSyncPayloadDto {
  defaultGlobalCode?: string;
  prancheta?: Prancheta | null;

  /**
   * Escopo do Board: USER ou TENANT
   */
  scope?: 'USER' | 'TENANT';
}
