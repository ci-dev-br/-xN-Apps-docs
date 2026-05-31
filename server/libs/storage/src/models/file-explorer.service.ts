import { Injectable, Optional } from "@nestjs/common";
import { FilePermissionService } from "../service/file-permission.service";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { FileDto } from "../controller/dto/file-dto";

@Injectable()
export class FileExplorerService {
    constructor(
        @Optional() private readonly filePermissions: FilePermissionService,
    ) { }

    async readDirectory(input: FileDto, request: Request) {
        try {
            if (!!this.filePermissions) {
                if (await this.filePermissions.grant(input.path, request)) {

                } else {
                    return null;
                }
            }
            return readdirSync(input.path, {
                withFileTypes: true,
            }).map(v => {
                return {
                    ...v,
                    isCharacterDevice: v.isCharacterDevice(),
                    isFile: v.isFile(),
                    isDirectory: v.isDirectory(),
                    isSocket: v.isSocket(),
                    isFIFO: v.isFIFO(),
                    isSymbolicLink: v.isSymbolicLink(),
                }
            }).filter(f => f.name.indexOf('.') !== 0 && f.name.indexOf('$') !== 0);
        } catch (error) {
            console.trace(error);
        }
    }

    async readFile(input: FileDto, request: Request) {
        try {
            if (!!this.filePermissions) {
                if (await this.filePermissions.grant(input.path, request)) {

                } else {
                    throw new Error('Negado por Política de Acesso.')
                }
            }
            if (!input.data) {
                let readed = readFileSync(input.path, {
                    encoding: input.encoding as any || 'utf-8'
                });
                input.data = readed.toString();
            } else if (typeof input.data === 'string') {
                // TODO: implementar controle de versão em cima das alterações realizadas via API.
                console.log('writing file... ')
                writeFileSync(input.path,
                    input.data, { encoding: 'utf-8' }
                )
            }
            return input;
        } catch (error) {
            console.trace(error);
            return {
                status: 500,
                cause: error
            }
        }
    }
}