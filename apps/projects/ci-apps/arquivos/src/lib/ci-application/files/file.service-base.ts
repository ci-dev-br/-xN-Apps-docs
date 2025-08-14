import { IArquivo } from "./i-file";

export abstract class FileServiceBase {
    abstract load(): Promise<IArquivo[]>;
}