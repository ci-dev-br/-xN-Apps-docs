/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Category } from '../../models/category';
import { GetByInternalIdInputDto } from '../../models/get-by-internal-id-input-dto';

export interface CetByInternalIdcategory$Params {
      body: GetByInternalIdInputDto
}

export function cetByInternalIdcategory(http: HttpClient, rootUrl: string, params: CetByInternalIdcategory$Params, context?: HttpContext): Observable<StrictHttpResponse<Category>> {
  const rb = new RequestBuilder(rootUrl, cetByInternalIdcategory.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Category>;
    })
  );
}

cetByInternalIdcategory.PATH = '/Category/GetByInternalId';
