/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { InitUploadStorageMediaInputDto } from '../../models/init-upload-storage-media-input-dto';
import { InitUploadStorageMediaOutputDto } from '../../models/init-upload-storage-media-output-dto';

export interface InitUploadStorageMedia$Params {
      body: InitUploadStorageMediaInputDto
}

export function initUploadStorageMedia(http: HttpClient, rootUrl: string, params: InitUploadStorageMedia$Params, context?: HttpContext): Observable<StrictHttpResponse<InitUploadStorageMediaOutputDto>> {
  const rb = new RequestBuilder(rootUrl, initUploadStorageMedia.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<InitUploadStorageMediaOutputDto>;
    })
  );
}

initUploadStorageMedia.PATH = '/StorageMedia/InitUpload';
