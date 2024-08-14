/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { messageControllerFindClientBy } from '../fn/message/message-controller-find-client-by';
import { MessageControllerFindClientBy$Params } from '../fn/message/message-controller-find-client-by';

@Injectable({ providedIn: 'root' })
export class MessageService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `messageControllerFindClientBy()` */
  static readonly MessageControllerFindClientByPath = '/Message';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `messageControllerFindClientBy()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  messageControllerFindClientBy$Response(params: MessageControllerFindClientBy$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return messageControllerFindClientBy(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `messageControllerFindClientBy$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  messageControllerFindClientBy(params: MessageControllerFindClientBy$Params, context?: HttpContext): Observable<void> {
    return this.messageControllerFindClientBy$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
