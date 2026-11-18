/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { contactControllerFindByNameOrPhonenumber } from '../fn/contacts/contact-controller-find-by-name-or-phonenumber';
import { ContactControllerFindByNameOrPhonenumber$Params } from '../fn/contacts/contact-controller-find-by-name-or-phonenumber';

@Injectable()
export class ContactsService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `contactControllerFindByNameOrPhonenumber()` */
  static readonly ContactControllerFindByNameOrPhonenumberPath = '/Contacts/FindByNameOrPhonenumberContacts';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `contactControllerFindByNameOrPhonenumber()` instead.
   *
   * This method doesn't expect any request body.
   */
  contactControllerFindByNameOrPhonenumber$Response(params?: ContactControllerFindByNameOrPhonenumber$Params, context?: HttpContext): Observable<StrictHttpResponse<void>> {
    return contactControllerFindByNameOrPhonenumber(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `contactControllerFindByNameOrPhonenumber$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  contactControllerFindByNameOrPhonenumber(params?: ContactControllerFindByNameOrPhonenumber$Params, context?: HttpContext): Observable<void> {
    return this.contactControllerFindByNameOrPhonenumber$Response(params, context).pipe(
      map((r: StrictHttpResponse<void>): void => r.body)
    );
  }

}
