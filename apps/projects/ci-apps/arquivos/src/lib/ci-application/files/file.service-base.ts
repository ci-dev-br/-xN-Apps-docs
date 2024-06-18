import { IFile } from "./i-file";

export abstract class FileServiceBase {
    abstract load(): Promise<IFile[]>;
}