/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { deployerControllerReport } from '../fn/deployer/deployer-controller-report';
import { DeployerControllerReport$Params } from '../fn/deployer/deployer-controller-report';

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

}
