/* tslint:disable */
/* eslint-disable */
export interface QueryLogDto {
  alertaDisparado?: boolean;
  application?: string;
  deveCorrigir?: boolean;
  dispararAlerta?: boolean;
  endDate?: string;
  level?: 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal';
  limit?: number;
  offset?: number;
  origem?: string;
  search?: string;
  startDate?: string;
  status?: 'NOVO' | 'PENDENTE' | 'EM_ANALISE' | 'CORRIGIDO' | 'IGNORADO';
  userId?: string;
}
