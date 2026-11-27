/* tslint:disable */
/* eslint-disable */
import { Credential } from '../models/credential';
export interface CampanhaMarketing {
  createdAt?: Date | null;
  createdBy?: Credential | null;
  dataFim: Date | null;
  dataInicio: Date | null;
  deleted?: boolean | null;
  descricao: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: Credential | null;
  nome: string;
  publicoAlvo: string | null;
  tenants?: Array<string> | null;
  tipo: 'Email Marketing' | 'SMS' | 'Redes Sociais' | 'Outro';
}
