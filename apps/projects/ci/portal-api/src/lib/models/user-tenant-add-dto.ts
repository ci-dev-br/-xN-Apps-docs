/* tslint:disable */
/* eslint-disable */
export interface UserTenantAddDto {
  emailOrUsername?: string | null;
  roles?: Array<string> | null;
  tenantId: string;
  userId?: string | null;
}
