/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Product } from '../../models/product';
import { ProductCotrollerGetInputDto } from '../../models/product-cotroller-get-input-dto';

export interface GetListProduct$Params {
      body: ProductCotrollerGetInputDto
}

export function getListProduct(http: HttpClient, rootUrl: string, params: GetListProduct$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Product>>> {
  const rb = new RequestBuilder(rootUrl, getListProduct.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<Product>>;
    })
  );
}

getListProduct.PATH = '/Product/Get';
