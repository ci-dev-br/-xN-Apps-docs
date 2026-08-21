/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { Dictionary } from '../models/dictionary';
import { getDictionaryI11N } from '../fn/i-11-n/get-dictionary-i-11-n';
import { GetDictionaryI11N$Params } from '../fn/i-11-n/get-dictionary-i-11-n';

@Injectable()
export class I11NService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getDictionaryI11N()` */
  static readonly GetDictionaryI11NPath = '/I11n/GetDictionary';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDictionaryI11N()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDictionaryI11N$Response(params: GetDictionaryI11N$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Dictionary>>> {
    return getDictionaryI11N(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDictionaryI11N$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  getDictionaryI11N(params: GetDictionaryI11N$Params, context?: HttpContext): Observable<Array<Dictionary>> {
    return this.getDictionaryI11N$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<Dictionary>>): Array<Dictionary> => r.body)
    );
  }

}
