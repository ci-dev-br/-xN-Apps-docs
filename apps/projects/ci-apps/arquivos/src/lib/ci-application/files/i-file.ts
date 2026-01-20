import { ReadDirectoryOutput } from "@ci/portal-api";

export interface IArquivo {
    iconType?: string;
    name?: string;
    icon?: string;
    info?: ReadDirectoryOutput;
}