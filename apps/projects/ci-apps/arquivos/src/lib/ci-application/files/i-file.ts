import { ReadDirectoryOutput } from "@ci/portal-api";

export interface IArquivo {
    name?: string;
    icon?: string;
    info?: ReadDirectoryOutput;
}