/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { Product } from '../../models/product';
import { ProductCotrollerGetInputDto } from '../../models/product-cotroller-get-input-dto';

export interface ProductGet$Params {
      body: ProductCotrollerGetInputDto
}

export function productGet(http: HttpClient, rootUrl: string, params: ProductGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<Product>>> {
  const rb = new RequestBuilder(rootUrl, productGet.PATH, 'post');
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

productGet.PATH = '/Product/Get';
