/* tslint:disable */
/* eslint-disable */
export interface SaveWorkspacePackInputDto {
  code: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  linkedActions?: Array<string>;
  name?: string;
  previousCode?: string;
  targetApps?: Array<string>;
  version?: string;
  writeToAssets?: boolean;
}
