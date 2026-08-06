import { Injectable, Optional } from "@nestjs/common";
import { FilePermissionService } from "../service/file-permission.service";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { FileDto } from "../controller/dto/file-dto";
import { join } from 'path';
import { GitService } from "../service/git.service";

@Injectable()
export class FileExplorerService {
    constructor(
        private readonly gitService: GitService,
        @Optional() private readonly filePermissions: FilePermissionService,
    ) { }

    async readDirectory(input: FileDto, request: Request, maxDepth: number = 3) {
        try {
            if (this.filePermissions) {
                if (!(await this.filePermissions.grant(input.path, request))) {
                    return null;
                }
            }

            // Inicia a leitura no nível 1
            return this.getDirectoryContents(input.path, 1, maxDepth);
        } catch (error) {
            console.trace(error);
            return null;
        }
    }

    /**
     * Método auxiliar recursivo para ler diretórios até a profundidade máxima estipulada
     */
    private getDirectoryContents(dirPath: string, currentDepth: number, maxDepth: number) {
        if (currentDepth > maxDepth) {
            return [];
        }

        const items = readdirSync(dirPath, { withFileTypes: true });

        return items
            .filter(f => !f.name.startsWith('.') && !f.name.startsWith('$'))
            .map(v => {
                const isDirectory = v.isDirectory();
                const itemPath = join(dirPath, v.name);

                return {
                    ...v,
                    path: itemPath,
                    isCharacterDevice: v.isCharacterDevice(),
                    isFile: v.isFile(),
                    isDirectory: isDirectory,
                    isSocket: v.isSocket(),
                    isFIFO: v.isFIFO(),
                    isSymbolicLink: v.isSymbolicLink(),
                    // Se for um diretório e não tiver atingido o limite, busca as subpastas
                    children: isDirectory && currentDepth < maxDepth
                        ? this.getDirectoryContents(itemPath, currentDepth + 1, maxDepth)
                        : [],
                };
            });
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
                console.log('writing file... ');
                writeFileSync(input.path,
                    input.data, { encoding: 'utf-8' }
                )
            }
            input.gitStatus = await this.gitService.status(input, request);
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