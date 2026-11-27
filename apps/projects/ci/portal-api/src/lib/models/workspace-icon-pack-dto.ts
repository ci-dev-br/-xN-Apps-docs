/* tslint:disable */
/* eslint-disable */
import { WorkspaceIconItemDto } from '../models/workspace-icon-item-dto';
export interface WorkspaceIconPackDto {
  basePath?: string;
  code: string;
  description?: string;
  iconCount?: number;
  icons?: Array<WorkspaceIconItemDto>;
  internalId?: string;
  isActive?: boolean;
  isDefault?: boolean;
  linkedActions?: Array<string>;
  name: string;
  source?: string;
  targetApps?: Array<string>;
  version?: string;
}
