/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { ActionResponseDto } from '../../models/action-response-dto';
import { PublishActionInputDto } from '../../models/publish-action-input-dto';

export interface PublishDeployer$Params {
      body: PublishActionInputDto
}

export function publishDeployer(http: HttpClient, rootUrl: string, params: PublishDeployer$Params, context?: HttpContext): Observable<StrictHttpResponse<ActionResponseDto>> {
  const rb = new RequestBuilder(rootUrl, publishDeployer.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<ActionResponseDto>;
    })
  );
}

publishDeployer.PATH = '/Deployer/publish';
