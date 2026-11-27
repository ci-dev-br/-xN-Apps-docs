/* tslint:disable */
/* eslint-disable */
import { FilePermissionItemDto } from '../models/file-permission-item-dto';
export interface MyFilePermissionsOutputDto {
  authorizedPaths: Array<string>;
  pendingRequests: Array<FilePermissionItemDto>;
  permissions: Array<FilePermissionItemDto>;
}
