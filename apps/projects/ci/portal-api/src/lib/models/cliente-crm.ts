/* tslint:disable */
/* eslint-disable */
export interface ClienteCrm {
  cep: string | null;
  cidade: string | null;
  cpf: string;
  createdAt?: Date | null;
  createdBy?: {
} | null;
  dataCadastro: string;
  dataNascimento: string | null;
  email: string | null;
  endereco: string | null;
  estado: string | null;
  internalId?: string | null;
  lastModifiedAt?: Date | null;
  lastModifiedBy?: {
} | null;
  nome: string;
  observacoes: string | null;
  telefone: string | null;
  tenants?: Array<string> | null;
}
