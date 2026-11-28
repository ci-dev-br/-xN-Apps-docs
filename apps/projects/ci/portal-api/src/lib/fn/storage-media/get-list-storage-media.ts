/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ObterListaStorageAsset } from '../../models/obter-lista-storage-asset';
import { StorageAsset } from '../../models/storage-asset';

export interface GetListStorageMedia$Params {
      body: ObterListaStorageAsset
}

export function getListStorageMedia(http: HttpClient, rootUrl: string, params: GetListStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<StorageAsset>>> {
  const rb = new RequestBuilder(rootUrl, getListStorageMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<StorageAsset>>;
    })
  );
}

getListStorageMedia.PATH = '/StorageMedia/GetList';
