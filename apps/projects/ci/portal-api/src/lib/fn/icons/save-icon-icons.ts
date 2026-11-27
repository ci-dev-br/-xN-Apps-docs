/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SaveWorkspaceIconInputDto } from '../../models/save-workspace-icon-input-dto';
import { WorkspaceIconItemDto } from '../../models/workspace-icon-item-dto';

export interface SaveIconIcons$Params {
      body: SaveWorkspaceIconInputDto
}

export function saveIconIcons(http: HttpClient, rootUrl: string, params: SaveIconIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspaceIconItemDto>> {
  const rb = new RequestBuilder(rootUrl, saveIconIcons.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<WorkspaceIconItemDto>;
    })
  );
}

saveIconIcons.PATH = '/Icons/SaveIcon';
