/* tslint:disable */
/* eslint-disable */
export interface AuthorizeFilePermissionOutputDto {
  authorized: boolean;
  denied?: boolean;
  message?: string;
  path?: string;
  requestedByEmail?: string;
  requestedByUserId?: string;
  status?: string;
}
