/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SaveWorkspacePackInputDto } from '../../models/save-workspace-pack-input-dto';
import { WorkspaceIconPackDto } from '../../models/workspace-icon-pack-dto';

export interface SavePackIcons$Params {
      body: SaveWorkspacePackInputDto
}

export function savePackIcons(http: HttpClient, rootUrl: string, params: SavePackIcons$Params, context?: HttpContext): Observable<StrictHttpResponse<WorkspaceIconPackDto>> {
  const rb = new RequestBuilder(rootUrl, savePackIcons.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<WorkspaceIconPackDto>;
    })
  );
}

savePackIcons.PATH = '/Icons/SavePack';
