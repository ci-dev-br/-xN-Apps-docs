/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { ActionResponseDto } from '../models/action-response-dto';
import { AppStatusResponseDto } from '../models/app-status-response-dto';
import { deployerControllerExecuteCommit } from '../fn/deployer/deployer-controller-execute-commit';
import { DeployerControllerExecuteCommit$Params } from '../fn/deployer/deployer-controller-execute-commit';
import { deployerControllerGetAppStatus } from '../fn/deployer/deployer-controller-get-app-status';
import { DeployerControllerGetAppStatus$Params } from '../fn/deployer/deployer-controller-get-app-status';
import { deployerControllerGetCommits } from '../fn/deployer/deployer-controller-get-commits';
import { DeployerControllerGetCommits$Params } from '../fn/deployer/deployer-controller-get-commits';
import { deployerControllerReport } from '../fn/deployer/deployer-controller-report';
import { DeployerControllerReport$Params } from '../fn/deployer/deployer-controller-report';
import { deployerControllerStartApp } from '../fn/deployer/deployer-controller-start-app';
import { DeployerControllerStartApp$Params } from '../fn/deployer/deployer-controller-start-app';
import { deployerControllerStopApp } from '../fn/deployer/deployer-controller-stop-app';
import { DeployerControllerStopApp$Params } from '../fn/deployer/deployer-controller-stop-app';
import { GetCommitsResponseDto } from '../models/get-commits-response-dto';

@Injectable()
export class DeployerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `deployerControllerReport()` */
  static readonly DeployerControllerReportPath = '/Deployer/report';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deployerControllerReport()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deployerControllerReport$Response(params: DeployerControllerReport$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return deployerControllerReport(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deployerControllerReport$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deployerControllerReport(params: DeployerControllerReport$Params, context?: HttpContext): Observable<void> {
    return this.deployerControllerReport$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `deployerControllerGetCommits()` */
  static readonly DeployerControllerGetCommitsPath = '/Deployer/commits';

  /**
   * Obtém a árvore de commits do repositório.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deployerControllerGetCommits()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerGetCommits$Response(params?: DeployerControllerGetCommits$Params, context?: HttpContext): Observable<StrictHttpResponse<GetCommitsResponseDto>> {
    return deployerControllerGetCommits(this.http, this.rootUrl, params, context);
  }

  /**
   * Obtém a árvore de commits do repositório.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deployerControllerGetCommits$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerGetCommits(params?: DeployerControllerGetCommits$Params, context?: HttpContext): Observable<GetCommitsResponseDto> {
    return this.deployerControllerGetCommits$Response(params, context).pipe(
      map((r: StrictHttpResponse<GetCommitsResponseDto>): GetCommitsResponseDto => r.body)
    );
  }

  /** Path part for operation `deployerControllerExecuteCommit()` */
  static readonly DeployerControllerExecuteCommitPath = '/Deployer/commit';

  /**
   * Executa a rotina padrão de git add . e commit.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deployerControllerExecuteCommit()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerExecuteCommit$Response(params?: DeployerControllerExecuteCommit$Params, context?: HttpContext): Observable<StrictHttpResponse<ActionResponseDto>> {
    return deployerControllerExecuteCommit(this.http, this.rootUrl, params, context);
  }

  /**
   * Executa a rotina padrão de git add . e commit.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deployerControllerExecuteCommit$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerExecuteCommit(params?: DeployerControllerExecuteCommit$Params, context?: HttpContext): Observable<ActionResponseDto> {
    return this.deployerControllerExecuteCommit$Response(params, context).pipe(
      map((r: StrictHttpResponse<ActionResponseDto>): ActionResponseDto => r.body)
    );
  }

  /** Path part for operation `deployerControllerStartApp()` */
  static readonly DeployerControllerStartAppPath = '/Deployer/app/start';

  /**
   * Inicia o processo de desenvolvimento (ng serve).
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deployerControllerStartApp()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deployerControllerStartApp$Response(params: DeployerControllerStartApp$Params, context?: HttpContext): Observable<StrictHttpResponse<ActionResponseDto>> {
    return deployerControllerStartApp(this.http, this.rootUrl, params, context);
  }

  /**
   * Inicia o processo de desenvolvimento (ng serve).
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deployerControllerStartApp$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  deployerControllerStartApp(params: DeployerControllerStartApp$Params, context?: HttpContext): Observable<ActionResponseDto> {
    return this.deployerControllerStartApp$Response(params, context).pipe(
      map((r: StrictHttpResponse<ActionResponseDto>): ActionResponseDto => r.body)
    );
  }

  /** Path part for operation `deployerControllerStopApp()` */
  static readonly DeployerControllerStopAppPath = '/Deployer/app/stop';

  /**
   * Interrompe o processo de desenvolvimento.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deployerControllerStopApp()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerStopApp$Response(params?: DeployerControllerStopApp$Params, context?: HttpContext): Observable<StrictHttpResponse<ActionResponseDto>> {
    return deployerControllerStopApp(this.http, this.rootUrl, params, context);
  }

  /**
   * Interrompe o processo de desenvolvimento.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deployerControllerStopApp$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerStopApp(params?: DeployerControllerStopApp$Params, context?: HttpContext): Observable<ActionResponseDto> {
    return this.deployerControllerStopApp$Response(params, context).pipe(
      map((r: StrictHttpResponse<ActionResponseDto>): ActionResponseDto => r.body)
    );
  }

  /** Path part for operation `deployerControllerGetAppStatus()` */
  static readonly DeployerControllerGetAppStatusPath = '/Deployer/app/status';

  /**
   * Verifica o status e os últimos logs do processo.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deployerControllerGetAppStatus()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerGetAppStatus$Response(params?: DeployerControllerGetAppStatus$Params, context?: HttpContext): Observable<StrictHttpResponse<AppStatusResponseDto>> {
    return deployerControllerGetAppStatus(this.http, this.rootUrl, params, context);
  }

  /**
   * Verifica o status e os últimos logs do processo.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deployerControllerGetAppStatus$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deployerControllerGetAppStatus(params?: DeployerControllerGetAppStatus$Params, context?: HttpContext): Observable<AppStatusResponseDto> {
    return this.deployerControllerGetAppStatus$Response(params, context).pipe(
      map((r: StrictHttpResponse<AppStatusResponseDto>): AppStatusResponseDto => r.body)
    );
  }

}
