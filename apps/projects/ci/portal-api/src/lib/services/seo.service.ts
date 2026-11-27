/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { auditarPaginaSeo } from '../fn/seo/auditar-pagina-seo';
import { AuditarPaginaSeo$Params } from '../fn/seo/auditar-pagina-seo';
import { Category } from '../models/category';
import { DashboardSeoDto } from '../models/dashboard-seo-dto';
import { getDashboardSeo } from '../fn/seo/get-dashboard-seo';
import { GetDashboardSeo$Params } from '../fn/seo/get-dashboard-seo';
import { getFontesSeo } from '../fn/seo/get-fontes-seo';
import { GetFontesSeo$Params } from '../fn/seo/get-fontes-seo';
import { getTendenciasSeo } from '../fn/seo/get-tendencias-seo';
import { GetTendenciasSeo$Params } from '../fn/seo/get-tendencias-seo';
import { moverTarefaSeo } from '../fn/seo/mover-tarefa-seo';
import { MoverTarefaSeo$Params } from '../fn/seo/mover-tarefa-seo';
import { SeoPage } from '../models/seo-page';
import { SeoTarefa } from '../models/seo-tarefa';
import { Source } from '../models/source';

@Injectable()
export class SeoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getDashboardSeo()` */
  static readonly GetDashboardSeoPath = '/Seo/GetDashboard';

  /**
   * Obtém a visão geral consolidada do dashboard SEO (KPIs, domínios, páginas, palavras-chave, backlinks, campanhas, tarefas, fontes e tendências) com suporte a segmentação por tenants.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDashboardSeo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDashboardSeo$Response(params: GetDashboardSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<DashboardSeoDto>> {
    return getDashboardSeo(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém a visão geral consolidada do dashboard SEO (KPIs, domínios, páginas, palavras-chave, backlinks, campanhas, tarefas, fontes e tendências) com suporte a segmentação por tenants.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDashboardSeo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDashboard(params: GetDashboardSeo$Params, context?: HttpContext): Observable<DashboardSeoDto> {
    return this.getDashboardSeo$Response(params, context).pipe(
      map((r: StrictHttpResponse<DashboardSeoDto>): DashboardSeoDto => r.body)
    );
  }

  /** Path part for operation `auditarPaginaSeo()` */
  static readonly AuditarPaginaSeoPath = '/Seo/AuditarPagina';

  /**
   * Executa auditoria técnica on-page para uma página SEO e gera tarefas automaticamente para apontamentos críticos/alerta.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `auditarPaginaSeo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  auditarPaginaSeo$Response(params: AuditarPaginaSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoPage>> {
    return auditarPaginaSeo(this.http, this.rootUrl, params, context);
  }

  /**
   * Executa auditoria técnica on-page para uma página SEO e gera tarefas automaticamente para apontamentos críticos/alerta.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `auditarPaginaSeo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  auditarPagina(params: AuditarPaginaSeo$Params, context?: HttpContext): Observable<SeoPage> {
    return this.auditarPaginaSeo$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoPage>): SeoPage => r.body)
    );
  }

  /** Path part for operation `moverTarefaSeo()` */
  static readonly MoverTarefaSeoPath = '/Seo/MoverTarefa';

  /**
   * Altera o status de uma tarefa de manutenção SEO.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `moverTarefaSeo()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  moverTarefaSeo$Response(params: MoverTarefaSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoTarefa>> {
    return moverTarefaSeo(this.http, this.rootUrl, params, context);
  }

  /**
   * Altera o status de uma tarefa de manutenção SEO.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `moverTarefaSeo$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  moverTarefa(params: MoverTarefaSeo$Params, context?: HttpContext): Observable<SeoTarefa> {
    return this.moverTarefaSeo$Response(params, context).pipe(
      map((r: StrictHttpResponse<SeoTarefa>): SeoTarefa => r.body)
    );
  }

  /** Path part for operation `getFontesSeo()` */
  static readonly GetFontesSeoPath = '/Seo/GetFontes';

  /**
   * Lista saúde dos crawlers e fontes RSS monitoradas.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getFontesSeo()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFontesSeo$Response(params?: GetFontesSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Source>>> {
    return getFontesSeo(this.http, this.rootUrl, params, context);
  }

  /**
   * Lista saúde dos crawlers e fontes RSS monitoradas.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getFontesSeo$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getFontes(params?: GetFontesSeo$Params, context?: HttpContext): Observable<Array<Source>> {
    return this.getFontesSeo$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Source>>): Array<Source> => r.body)
    );
  }

  /** Path part for operation `getTendenciasSeo()` */
  static readonly GetTendenciasSeoPath = '/Seo/GetTendencias';

  /**
   * Lista tendências de busca capturadas.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getTendenciasSeo()` instead.
   *
   * This method doesn't expect any request body.
   */
  getTendenciasSeo$Response(params?: GetTendenciasSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Category>>> {
    return getTendenciasSeo(this.http, this.rootUrl, params, context);
  }

  /**
   * Lista tendências de busca capturadas.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getTendenciasSeo$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getTendencias(params?: GetTendenciasSeo$Params, context?: HttpContext): Observable<Array<Category>> {
    return this.getTendenciasSeo$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Category>>): Array<Category> => r.body)
    );
  }

}
