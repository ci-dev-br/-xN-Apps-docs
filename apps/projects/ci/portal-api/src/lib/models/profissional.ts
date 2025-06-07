/* tslint:disable */
/* eslint-disable */
export interface Profissional {
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataContratacao: Date | null;
  email: string | null;
  especialidade: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  nome: string;
  telefone: string | null;
  tenants?: Array<string> | null;
}
