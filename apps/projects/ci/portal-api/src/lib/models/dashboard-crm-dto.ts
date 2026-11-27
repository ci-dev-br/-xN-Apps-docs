/* tslint:disable */
/* eslint-disable */
import { AtividadeCrm } from '../models/atividade-crm';
import { ClienteCrm } from '../models/cliente-crm';
import { DashboardCrmContadoresDto } from '../models/dashboard-crm-contadores-dto';
import { DashboardCrmEtapaResumoDto } from '../models/dashboard-crm-etapa-resumo-dto';
import { DashboardCrmKpisDto } from '../models/dashboard-crm-kpis-dto';
import { Oportunidade } from '../models/oportunidade';
export interface DashboardCrmDto {
  atividades: Array<AtividadeCrm>;
  clientes: Array<ClienteCrm>;
  contadores: DashboardCrmContadoresDto;
  etapas: Array<DashboardCrmEtapaResumoDto>;
  kpis: DashboardCrmKpisDto;
  oportunidades: Array<Oportunidade>;
  responsaveis: Array<string>;
}
