/* tslint:disable */
/* eslint-disable */
export interface ReadDirectoryOutput {
  isDirectory?: boolean | null;
  isFIFO?: boolean | null;
  isFile?: boolean | null;
  isSocket?: boolean | null;
  isSymbolicLink?: boolean | null;
  name?: string | null;
  path?: string | null;
}
