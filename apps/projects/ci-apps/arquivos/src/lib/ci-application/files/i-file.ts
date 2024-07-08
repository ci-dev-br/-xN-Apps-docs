import { ReadDirectoryOutput } from "@ci/portal-api";

export interface IFile {
    name?: string;
    icon?: string;
    info?: ReadDirectoryOutput;
}