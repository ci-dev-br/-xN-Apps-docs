/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { CpuInfo } from '../../models/cpu-info';

export interface SystemLeitura$Params {
}

export function systemLeitura(http: HttpClient, rootUrl: string, params?: SystemLeitura$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<CpuInfo>>> {
  const rb = new RequestBuilder(rootUrl, systemLeitura.PATH, 'post');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<CpuInfo>>;
    })
  );
}

systemLeitura.PATH = '/System/Leitura';