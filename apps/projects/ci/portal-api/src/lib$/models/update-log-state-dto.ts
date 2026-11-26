/* tslint:disable */
/* eslint-disable */
export interface UpdateLogStateDto {
  alertDetails?: {
};
  alertaDisparado?: boolean;
  deveCorrigir?: boolean;
  dispararAlerta?: boolean;
  internalId: string;
  status?: 'NOVO' | 'PENDENTE' | 'EM_ANALISE' | 'CORRIGIDO' | 'IGNORADO';
}
