/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { GetAssetInfoStorageMediaInputDto } from '../../models/get-asset-info-storage-media-input-dto';
import { StorageAsset } from '../../models/storage-asset';

export interface GetAssetInfoStorageMedia$Params {
      body: GetAssetInfoStorageMediaInputDto
}

export function getAssetInfoStorageMedia(http: HttpClient, rootUrl: string, params: GetAssetInfoStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<StorageAsset>> {
  const rb = new RequestBuilder(rootUrl, getAssetInfoStorageMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<StorageAsset>;
    })
  );
}

getAssetInfoStorageMedia.PATH = '/StorageMedia/GetAssetInfo';
