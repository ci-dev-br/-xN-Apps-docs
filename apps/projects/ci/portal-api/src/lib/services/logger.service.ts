/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { getLogById } from '../fn/logger/get-log-by-id';
import { GetLogById$Params } from '../fn/logger/get-log-by-id';
import { ingestClientLog } from '../fn/logger/ingest-client-log';
import { IngestClientLog$Params } from '../fn/logger/ingest-client-log';
import { Log } from '../models/log';
import { queryLogs } from '../fn/logger/query-logs';
import { QueryLogs$Params } from '../fn/logger/query-logs';
import { registerBatchLogs } from '../fn/logger/register-batch-logs';
import { RegisterBatchLogs$Params } from '../fn/logger/register-batch-logs';
import { registerSystemLog } from '../fn/logger/register-system-log';
import { RegisterSystemLog$Params } from '../fn/logger/register-system-log';
import { registryLog } from '../fn/logger/registry-log';
import { RegistryLog$Params } from '../fn/logger/registry-log';
import { triggerLogAlert } from '../fn/logger/trigger-log-alert';
import { TriggerLogAlert$Params } from '../fn/logger/trigger-log-alert';
import { updateLogState } from '../fn/logger/update-log-state';
import { UpdateLogState$Params } from '../fn/logger/update-log-state';

@Injectable()
export class LoggerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `registerSystemLog()` */
  static readonly RegisterSystemLogPath = '/Logger/Register';

  /**
   * Registrar log de sistema (Exclusivo ROLE MASTER).
   *
   * Registra e cataloga logs de sistemas contendo credenciais de acesso, estado de correção e disparo de alertas.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registerSystemLog()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registerSystemLog$Response(params: RegisterSystemLog$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
    return registerSystemLog(this.http, this.rootUrl, params, context);
  }

  /**
   * Registrar log de sistema (Exclusivo ROLE MASTER).
   *
   * Registra e cataloga logs de sistemas contendo credenciais de acesso, estado de correção e disparo de alertas.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registerSystemLog$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registerSystemLog(params: RegisterSystemLog$Params, context?: HttpContext): Observable<Log> {
    return this.registerSystemLog$Response(params, context).pipe(
      map((r: StrictHttpResponse<Log>): Log => r.body)
    );
  }

  /** Path part for operation `registryLog()` */
  static readonly RegistryLogPath = '/Logger/Registry';

  /**
   * Registry (Alias).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registryLog()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registryLog$Response(params: RegistryLog$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
    return registryLog(this.http, this.rootUrl, params, context);
  }

  /**
   * Registry (Alias).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registryLog$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registryLog(params: RegistryLog$Params, context?: HttpContext): Observable<Log> {
    return this.registryLog$Response(params, context).pipe(
      map((r: StrictHttpResponse<Log>): Log => r.body)
    );
  }

  /** Path part for operation `queryLogs()` */
  static readonly QueryLogsPath = '/Logger/Query';

  /**
   * Consultar logs catalogados (Exclusivo ROLE MASTER).
   *
   * Filtra logs por nível, origem, aplicação, estado de correção, disparo de alertas e credenciais.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `queryLogs()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  queryLogs$Response(params: QueryLogs$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return queryLogs(this.http, this.rootUrl, params, context);
  }

  /**
   * Consultar logs catalogados (Exclusivo ROLE MASTER).
   *
   * Filtra logs por nível, origem, aplicação, estado de correção, disparo de alertas e credenciais.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `queryLogs$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  queryLogs(params: QueryLogs$Params, context?: HttpContext): Observable<void> {
    return this.queryLogs$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `getLogById()` */
  static readonly GetLogByIdPath = '/Logger/{id}';

  /**
   * Obter detalhes do log por ID (Exclusivo ROLE MASTER).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getLogById()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLogById$Response(params: GetLogById$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
    return getLogById(this.http, this.rootUrl, params, context);
  }

  /**
   * Obter detalhes do log por ID (Exclusivo ROLE MASTER).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getLogById$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLogById(params: GetLogById$Params, context?: HttpContext): Observable<Log> {
    return this.getLogById$Response(params, context).pipe(
      map((r: StrictHttpResponse<Log>): Log => r.body)
    );
  }

  /** Path part for operation `updateLogState()` */
  static readonly UpdateLogStatePath = '/Logger/UpdateState';

  /**
   * Atualizar estado do log (Exclusivo ROLE MASTER).
   *
   * Define se o log deve ser corrigido, altera o status de tratamento e controla o disparo de alertas.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateLogState()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateLogState$Response(params: UpdateLogState$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
    return updateLogState(this.http, this.rootUrl, params, context);
  }

  /**
   * Atualizar estado do log (Exclusivo ROLE MASTER).
   *
   * Define se o log deve ser corrigido, altera o status de tratamento e controla o disparo de alertas.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateLogState$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateLogState(params: UpdateLogState$Params, context?: HttpContext): Observable<Log> {
    return this.updateLogState$Response(params, context).pipe(
      map((r: StrictHttpResponse<Log>): Log => r.body)
    );
  }

  /** Path part for operation `triggerLogAlert()` */
  static readonly TriggerLogAlertPath = '/Logger/TriggerAlert';

  /**
   * Disparar alerta para log (Exclusivo ROLE MASTER).
   *
   * Força o disparo de alerta para o log especificado informando os canais e o motivo.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `triggerLogAlert()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  triggerLogAlert$Response(params: TriggerLogAlert$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
    return triggerLogAlert(this.http, this.rootUrl, params, context);
  }

  /**
   * Disparar alerta para log (Exclusivo ROLE MASTER).
   *
   * Força o disparo de alerta para o log especificado informando os canais e o motivo.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `triggerLogAlert$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  triggerLogAlert(params: TriggerLogAlert$Params, context?: HttpContext): Observable<Log> {
    return this.triggerLogAlert$Response(params, context).pipe(
      map((r: StrictHttpResponse<Log>): Log => r.body)
    );
  }

  /** Path part for operation `registerBatchLogs()` */
  static readonly RegisterBatchLogsPath = '/Logger/Batch';

  /**
   * Registrar lote de logs de sistemas (Exclusivo ROLE MASTER).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `registerBatchLogs()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registerBatchLogs$Response(params: RegisterBatchLogs$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return registerBatchLogs(this.http, this.rootUrl, params, context);
  }

  /**
   * Registrar lote de logs de sistemas (Exclusivo ROLE MASTER).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `registerBatchLogs$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  registerBatchLogs(params: RegisterBatchLogs$Params, context?: HttpContext): Observable<void> {
    return this.registerBatchLogs$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `ingestClientLog()` */
  static readonly IngestClientLogPath = '/Logger/Client';

  /**
   * Consumo de logs do cliente.
   *
   * Recebe logs enviados pelo cliente, associando automaticamente às credenciais de acesso do usuário.
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `ingestClientLog()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ingestClientLog$Response(params: IngestClientLog$Params, context?: HttpContext): Observable<StrictHttpResponse<Log>> {
    return ingestClientLog(this.http, this.rootUrl, params, context);
  }

  /**
   * Consumo de logs do cliente.
   *
   * Recebe logs enviados pelo cliente, associando automaticamente às credenciais de acesso do usuário.
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `ingestClientLog$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ingestClientLog(params: IngestClientLog$Params, context?: HttpContext): Observable<Log> {
    return this.ingestClientLog$Response(params, context).pipe(
      map((r: StrictHttpResponse<Log>): Log => r.body)
    );
  }

}
