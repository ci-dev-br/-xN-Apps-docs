/* tslint:disable */
/* eslint-disable */
export interface Log {
  alertDetails?: {
};
  alertaDisparado?: boolean;
  application?: string;
  chaveAcessoReference?: string;
  deveCorrigir?: boolean;
  dispararAlerta?: boolean;
  internalId?: string;
  level?: 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal';
  log?: {
};
  message?: string;
  metadata?: {
};

  /**
   * CLIENT, SERVER, CLIENT_ANGULAR, SERVER_NESTJS, etc.
   */
  origem?: string;
  status?: 'NOVO' | 'PENDENTE' | 'EM_ANALISE' | 'CORRIGIDO' | 'IGNORADO';
  userCredentials?: {
};
  userEmail?: string;
  userId?: string;
  userRoles?: Array<string>;
}
