/* tslint:disable */
/* eslint-disable */
import { Category } from '../models/category';
import { DashboardSeoKpisDto } from '../models/dashboard-seo-kpis-dto';
import { DashboardSeoTarefasPorStatusDto } from '../models/dashboard-seo-tarefas-por-status-dto';
import { SeoBackLink } from '../models/seo-back-link';
import { SeoCampanha } from '../models/seo-campanha';
import { SeoDomain } from '../models/seo-domain';
import { SeoKeyWord } from '../models/seo-key-word';
import { SeoPage } from '../models/seo-page';
import { SeoTarefa } from '../models/seo-tarefa';
import { Source } from '../models/source';
export interface DashboardSeoDto {
  backlinks: Array<SeoBackLink>;
  campanhas: Array<SeoCampanha>;
  dominios: Array<SeoDomain>;
  fontes: Array<Source>;
  kpis: DashboardSeoKpisDto;
  paginas: Array<SeoPage>;
  palavrasChave: Array<SeoKeyWord>;
  pioresPaginas: Array<SeoPage>;
  tarefas: Array<SeoTarefa>;
  tarefasPorStatus: DashboardSeoTarefasPorStatusDto;
  tendencias: Array<Category>;
}
