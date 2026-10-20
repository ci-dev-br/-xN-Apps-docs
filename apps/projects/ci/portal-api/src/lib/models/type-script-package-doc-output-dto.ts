/* tslint:disable */
/* eslint-disable */
import { TypeScriptExportedSymbolDto } from '../models/type-script-exported-symbol-dto';
export interface TypeScriptPackageDocOutputDto {
  description?: string;
  exportedSymbols: Array<TypeScriptExportedSymbolDto>;
  homepage?: string;
  license?: string;
  markdown: string;
  name: string;
  readmeSnippet?: string;
  repository?: string;
  typesPath?: string;
  version: string;
}
