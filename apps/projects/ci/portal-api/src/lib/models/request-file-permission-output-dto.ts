/* tslint:disable */
/* eslint-disable */
export interface RequestFilePermissionOutputDto {
  alreadyAuthorized?: boolean;
  authorizeLink?: string;
  emailsSent?: number;
  message?: string;
  path: string;
  requestToken?: string;
  requested: boolean;
  status?: string;
  sysadminCount?: number;
}
