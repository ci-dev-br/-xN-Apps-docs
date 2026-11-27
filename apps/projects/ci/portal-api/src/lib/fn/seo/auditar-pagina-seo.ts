/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { AuditarPaginaSeoDto } from '../../models/auditar-pagina-seo-dto';
import { SeoPage } from '../../models/seo-page';

export interface AuditarPaginaSeo$Params {
      body: AuditarPaginaSeoDto
}

export function auditarPaginaSeo(http: HttpClient, rootUrl: string, params: AuditarPaginaSeo$Params, context?: HttpContext): Observable<StrictHttpResponse<SeoPage>> {
  const rb = new RequestBuilder(rootUrl, auditarPaginaSeo.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SeoPage>;
    })
  );
}

auditarPaginaSeo.PATH = '/Seo/AuditarPagina';
