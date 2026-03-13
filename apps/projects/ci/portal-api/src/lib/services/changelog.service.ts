/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { changelogControllerGetActivityLogs } from '../fn/changelog/changelog-controller-get-activity-logs';
import { ChangelogControllerGetActivityLogs$Params } from '../fn/changelog/changelog-controller-get-activity-logs';
import { changelogControllerGetChangelog } from '../fn/changelog/changelog-controller-get-changelog';
import { ChangelogControllerGetChangelog$Params } from '../fn/changelog/changelog-controller-get-changelog';
import { changelogControllerUpdateStatus } from '../fn/changelog/changelog-controller-update-status';
import { ChangelogControllerUpdateStatus$Params } from '../fn/changelog/changelog-controller-update-status';

@Injectable()
export class ChangelogService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `changelogControllerGetChangelog()` */
  static readonly ChangelogControllerGetChangelogPath = '/changelog';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `changelogControllerGetChangelog()` instead.
   *
   * This method doesn't expect any request body.
   */
  changelogControllerGetChangelog$Response(params?: ChangelogControllerGetChangelog$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return changelogControllerGetChangelog(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `changelogControllerGetChangelog$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ControllerGetChangelog(params?: ChangelogControllerGetChangelog$Params, context?: HttpContext): Observable<void> {
    return this.changelogControllerGetChangelog$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `changelogControllerGetActivityLogs()` */
  static readonly ChangelogControllerGetActivityLogsPath = '/changelog/logs';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `changelogControllerGetActivityLogs()` instead.
   *
   * This method doesn't expect any request body.
   */
  changelogControllerGetActivityLogs$Response(params?: ChangelogControllerGetActivityLogs$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return changelogControllerGetActivityLogs(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `changelogControllerGetActivityLogs$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  ControllerGetActivityLogs(params?: ChangelogControllerGetActivityLogs$Params, context?: HttpContext): Observable<void> {
    return this.changelogControllerGetActivityLogs$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

  /** Path part for operation `changelogControllerUpdateStatus()` */
  static readonly ChangelogControllerUpdateStatusPath = '/changelog/status';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `changelogControllerUpdateStatus()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  changelogControllerUpdateStatus$Response(params: ChangelogControllerUpdateStatus$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return changelogControllerUpdateStatus(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `changelogControllerUpdateStatus$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  ControllerUpdateStatus(params: ChangelogControllerUpdateStatus$Params, context?: HttpContext): Observable<void> {
    return this.changelogControllerUpdateStatus$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
