/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { seoAuditarPagina } from '../fn/seo/seo-auditar-pagina';
import { SeoAuditarPagina$Params } from '../fn/seo/seo-auditar-pagina';
import { seoDashboard } from '../fn/seo/seo-dashboard';
import { SeoDashboard$Params } from '../fn/seo/seo-dashboard';
import { seoExcluir } from '../fn/seo/seo-excluir';
import { SeoExcluir$Params } from '../fn/seo/seo-excluir';
import { seoFontes } from '../fn/seo/seo-fontes';
import { SeoFontes$Params } from '../fn/seo/seo-fontes';
import { seoListar } from '../fn/seo/seo-listar';
import { SeoListar$Params } from '../fn/seo/seo-listar';
import { seoMoverTarefa } from '../fn/seo/seo-mover-tarefa';
import { SeoMoverTarefa$Params } from '../fn/seo/seo-mover-tarefa';
import { seoSalvar } from '../fn/seo/seo-salvar';
import { SeoSalvar$Params } from '../fn/seo/seo-salvar';
import { seoTendencias } from '../fn/seo/seo-tendencias';
import { SeoTendencias$Params } from '../fn/seo/seo-tendencias';

@Injectable()
export class SeoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `seoDashboard()` */
  static readonly SeoDashboardPath = '/Seo/Dashboard';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoDashboard()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoDashboard$Response(params?: SeoDashboard$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoDashboard(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoDashboard$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoDashboard(params?: SeoDashboard$Params, context?: HttpContext): Observable<void> {
    return this.seoDashboard$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoListar()` */
  static readonly SeoListarPath = '/Seo/{recurso}/Listar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoListar()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  seoListar$Response(params: SeoListar$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoListar(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoListar$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  seoListar(params: SeoListar$Params, context?: HttpContext): Observable<void> {
    return this.seoListar$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoSalvar()` */
  static readonly SeoSalvarPath = '/Seo/{recurso}/Salvar';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoSalvar()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoSalvar$Response(params: SeoSalvar$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoSalvar(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoSalvar$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoSalvar(params: SeoSalvar$Params, context?: HttpContext): Observable<void> {
    return this.seoSalvar$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoExcluir()` */
  static readonly SeoExcluirPath = '/Seo/{recurso}/Excluir/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoExcluir()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoExcluir$Response(params: SeoExcluir$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoExcluir(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoExcluir$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoExcluir(params: SeoExcluir$Params, context?: HttpContext): Observable<void> {
    return this.seoExcluir$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoAuditarPagina()` */
  static readonly SeoAuditarPaginaPath = '/Seo/Paginas/Auditar/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoAuditarPagina()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoAuditarPagina$Response(params: SeoAuditarPagina$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoAuditarPagina(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoAuditarPagina$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoAuditarPagina(params: SeoAuditarPagina$Params, context?: HttpContext): Observable<void> {
    return this.seoAuditarPagina$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoMoverTarefa()` */
  static readonly SeoMoverTarefaPath = '/Seo/Tarefas/Mover/{id}/{status}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoMoverTarefa()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoMoverTarefa$Response(params: SeoMoverTarefa$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoMoverTarefa(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoMoverTarefa$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoMoverTarefa(params: SeoMoverTarefa$Params, context?: HttpContext): Observable<void> {
    return this.seoMoverTarefa$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoFontes()` */
  static readonly SeoFontesPath = '/Seo/Fontes';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoFontes()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoFontes$Response(params?: SeoFontes$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoFontes(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoFontes$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoFontes(params?: SeoFontes$Params, context?: HttpContext): Observable<void> {
    return this.seoFontes$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `seoTendencias()` */
  static readonly SeoTendenciasPath = '/Seo/Tendencias';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `seoTendencias()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoTendencias$Response(params?: SeoTendencias$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return seoTendencias(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `seoTendencias$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  seoTendencias(params?: SeoTendencias$Params, context?: HttpContext): Observable<void> {
    return this.seoTendencias$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
