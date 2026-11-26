/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Application } from '../../models/application';
import { CatalogAppDto } from '../../models/catalog-app-dto';

export interface CatalogApplication$Params {
  'x-origin-application': string;
  'x-application-git-hash': string;
      body: CatalogAppDto
}

export function catalogApplication(http: HttpClient, rootUrl: string, params: CatalogApplication$Params, context?: HttpContext): Observable<StrictHttpResponse<Application>> {
  const rb = new RequestBuilder(rootUrl, catalogApplication.PATH, 'post');
  if (params) {
    rb.header('x-origin-application', params['x-origin-application'], {});
    rb.header('x-application-git-hash', params['x-application-git-hash'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Application>;
    })
  );
}

catalogApplication.PATH = '/Application/Catalog';
