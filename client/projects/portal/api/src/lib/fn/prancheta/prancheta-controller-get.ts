/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Prancheta } from '../../models/prancheta';
import { PranchetaSyncPayloadDto } from '../../models/prancheta-sync-payload-dto';

export interface PranchetaControllerGet$Params {
      body: PranchetaSyncPayloadDto
}

export function pranchetaControllerGet(http: HttpClient, rootUrl: string, params: PranchetaControllerGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Prancheta>>> {
  const rb = new RequestBuilder(rootUrl, pranchetaControllerGet.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Prancheta>>;
    })
  );
}

pranchetaControllerGet.PATH = '/Prancheta/Get';
