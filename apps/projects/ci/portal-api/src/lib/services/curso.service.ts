/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Curso } from '../models/curso';
import { deleteCurso } from '../fn/curso/delete-curso';
import { DeleteCurso$Params } from '../fn/curso/delete-curso';
import { getByInternalIdCurso } from '../fn/curso/get-by-internal-id-curso';
import { GetByInternalIdCurso$Params } from '../fn/curso/get-by-internal-id-curso';
import { getCatalogoCurso } from '../fn/curso/get-catalogo-curso';
import { GetCatalogoCurso$Params } from '../fn/curso/get-catalogo-curso';
import { GetCatalogoCursoOutputDto } from '../models/get-catalogo-curso-output-dto';
import { getListCurso } from '../fn/curso/get-list-curso';
import { GetListCurso$Params } from '../fn/curso/get-list-curso';
import { syncCurso } from '../fn/curso/sync-curso';
import { SyncCurso$Params } from '../fn/curso/sync-curso';

@Injectable()
export class CursoService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `syncCurso()` */
  static readonly SyncCursoPath = '/Curso/Sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `syncCurso()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  syncCurso$Response(params: SyncCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<Curso>> {
    return syncCurso(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `syncCurso$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: SyncCurso$Params, context?: HttpContext): Observable<Curso> {
    return this.syncCurso$Response(params, context).pipe(
      map((r: StrictHttpResponse<Curso>): Curso => r.body)
    );
  }

  /** Path part for operation `getByInternalIdCurso()` */
  static readonly GetByInternalIdCursoPath = '/Curso/GetByInternalId';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getByInternalIdCurso()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalIdCurso$Response(params: GetByInternalIdCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<Curso>> {
    return getByInternalIdCurso(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getByInternalIdCurso$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getByInternalId(params: GetByInternalIdCurso$Params, context?: HttpContext): Observable<Curso> {
    return this.getByInternalIdCurso$Response(params, context).pipe(
      map((r: StrictHttpResponse<Curso>): Curso => r.body)
    );
  }

  /** Path part for operation `getListCurso()` */
  static readonly GetListCursoPath = '/Curso/GetList';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getListCurso()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getListCurso$Response(params: GetListCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Curso>>> {
    return getListCurso(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getListCurso$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getList(params: GetListCurso$Params, context?: HttpContext): Observable<Array<Curso>> {
    return this.getListCurso$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Curso>>): Array<Curso> => r.body)
    );
  }

  /** Path part for operation `deleteCurso()` */
  static readonly DeleteCursoPath = '/Curso/Delete';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteCurso()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deleteCurso$Response(params: DeleteCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<Curso>> {
    return deleteCurso(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteCurso$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  delete(params: DeleteCurso$Params, context?: HttpContext): Observable<Curso> {
    return this.deleteCurso$Response(params, context).pipe(
      map((r: StrictHttpResponse<Curso>): Curso => r.body)
    );
  }

  /** Path part for operation `getCatalogoCurso()` */
  static readonly GetCatalogoCursoPath = '/Curso/GetCatalogo';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getCatalogoCurso()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getCatalogoCurso$Response(params: GetCatalogoCurso$Params, context?: HttpContext): Observable<StrictHttpResponse<GetCatalogoCursoOutputDto>> {
    return getCatalogoCurso(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getCatalogoCurso$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getCatalogo(params: GetCatalogoCurso$Params, context?: HttpContext): Observable<GetCatalogoCursoOutputDto> {
    return this.getCatalogoCurso$Response(params, context).pipe(
      map((r: StrictHttpResponse<GetCatalogoCursoOutputDto>): GetCatalogoCursoOutputDto => r.body)
    );
  }

}
