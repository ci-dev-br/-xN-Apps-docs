/* tslint:disable */
/* eslint-disable */
export interface DashboardCrmEtapaResumoDto {
  cor: string;
  id: 'lead' | 'qualificacao' | 'proposta' | 'negociacao' | 'ganho' | 'perdido';
  quantidade: number;
  titulo: string;
  valorTotal: number;
}
