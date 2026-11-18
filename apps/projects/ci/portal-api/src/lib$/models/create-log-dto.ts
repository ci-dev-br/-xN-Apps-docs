/* tslint:disable */
/* eslint-disable */
export interface CreateLogDto {
  alertDetails?: {
};
  alertaDisparado?: boolean;
  application?: string;
  chaveAcessoReference?: string;
  deveCorrigir?: boolean;
  dispararAlerta?: boolean;
  level?: 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal';
  log: {
};
  message?: string;
  metadata?: {
};
  origem?: string;
  status?: 'NOVO' | 'PENDENTE' | 'EM_ANALISE' | 'CORRIGIDO' | 'IGNORADO';
  userCredentials?: {
};
  userEmail?: string;
  userId?: string;
  userRoles?: Array<string>;
}
