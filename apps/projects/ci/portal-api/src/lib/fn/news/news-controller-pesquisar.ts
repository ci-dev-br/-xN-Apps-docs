/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { FeedColumnDto } from '../../models/feed-column-dto';

export interface NewsControllerPesquisar$Params {
  textoConsulta?: string;
}

export function newsControllerPesquisar(http: HttpClient, rootUrl: string, params?: NewsControllerPesquisar$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<FeedColumnDto>>> {
  const rb = new RequestBuilder(rootUrl, newsControllerPesquisar.PATH, 'post');
  if (params) {
    rb.query('textoConsulta', params.textoConsulta, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<FeedColumnDto>>;
    })
  );
}

newsControllerPesquisar.PATH = '/News/pesquisar';
