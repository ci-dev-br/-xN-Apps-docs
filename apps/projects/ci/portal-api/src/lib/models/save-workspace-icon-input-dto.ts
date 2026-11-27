/* tslint:disable */
/* eslint-disable */
export interface SaveWorkspaceIconInputDto {
  category?: string;
  code: string;
  description?: string;
  linkedActions?: Array<string>;
  linkedApps?: Array<string>;
  name?: string;
  packCode: string;
  previousCode?: string;
  svgContent: string;
  tags?: Array<string>;
  updateApplicationEntity?: boolean;
  usageType?: string;
  viewBox?: string;
  writeToAssets?: boolean;
}
