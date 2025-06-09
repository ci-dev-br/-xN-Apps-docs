/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Prancheta } from '../../models/prancheta';
import { PranchetaSyncPayloadDto } from '../../models/prancheta-sync-payload-dto';

export interface PranchetaControllerSync$Params {
      body: PranchetaSyncPayloadDto
}

export function pranchetaControllerSync(http: HttpClient, rootUrl: string, params: PranchetaControllerSync$Params, context?: HttpContext): Observable<StrictHttpResponse<Prancheta>> {
  const rb = new RequestBuilder(rootUrl, pranchetaControllerSync.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Prancheta>;
    })
  );
}

pranchetaControllerSync.PATH = '/Prancheta/Sync';
