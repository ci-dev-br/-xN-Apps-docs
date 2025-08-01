/* tslint:disable */
/* eslint-disable */
import { Prancheta } from '../models/prancheta';
export interface PranchetaSyncPayloadDto {
  defaultGlobalCode?: string;
  prancheta?: Prancheta | null;
}
