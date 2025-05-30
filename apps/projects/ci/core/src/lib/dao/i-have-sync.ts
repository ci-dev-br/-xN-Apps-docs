import { HttpContext } from "@angular/common/http";
import { StrictHttpResponse } from "@ci/portal-api";
import { Observable } from "rxjs";

export interface ISyncPayloadDao<E> {
    data?: E;
}

export interface IHaveSync<E> {
    sync(params: { body: ISyncPayloadDao<E> }, context?: HttpContext): Observable<StrictHttpResponse<ISyncPayloadDao<E>>>;
}

export interface IHaveDelete<E> {
    delete(params: { body: ISyncPayloadDao<E> }, context?: HttpContext): Observable<StrictHttpResponse<ISyncPayloadDao<E>>>;
}
export interface IHaveGetList<E> {
    getList(params: { body: ISyncPayloadDao<E> }, context?: HttpContext): Observable<StrictHttpResponse<ISyncPayloadDao<E>>>;
}